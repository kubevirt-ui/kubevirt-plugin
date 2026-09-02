import React, { type FC, useState } from 'react';
import produce from 'immer';

import { type V1CPU, type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CPUInput from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/CPUInput';
import { getCPULimitsFromVM } from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import MemoryInput from '@kubevirt-utils/components/CPUMemoryModal/components/MemoryInput/MemoryInput';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { getCPU, getMemory, VM_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { type QuantityUnit } from '@kubevirt-utils/utils/unitConstants';
import { toQuantity } from '@kubevirt-utils/utils/units';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import {
  Alert,
  AlertVariant,
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import CPUMemoryModalFooter from './components/CPUMemoryModalFooter';
import useTemplateDefaultCpuMemory from './hooks/useTemplateDefaultCpuMemory';

import './cpu-memory-modal.scss';

type VirtuaMachineOrVoid = V1VirtualMachine | void;

type CPUMemoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<VirtuaMachineOrVoid> | VirtuaMachineOrVoid;
  templateNamespace?: string;
  vm: V1VirtualMachine;
};

const CPUMemoryModal: FC<CPUMemoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  templateNamespace = DEFAULT_NAMESPACE,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();

  const [updateInProcess, setUpdateInProcess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string>();

  const memoryQuantity = toQuantity(getMemory(vm));
  const { unit, value } = memoryQuantity ?? {};
  const [memory, setMemory] = useState<number | undefined>(value);
  const [memoryUnit, setMemoryUnit] = useState<QuantityUnit | undefined>(unit);
  const [cpu, setCPU] = useState<undefined | V1CPU>(() => getCPU(vm));

  const {
    data: templateDefaultsData,
    error: defaultLoadError,
    loaded: defaultsLoaded,
  } = useTemplateDefaultCpuMemory(
    vm?.metadata?.labels?.['vm.kubevirt.io/template'],
    vm?.metadata?.labels?.['vm.kubevirt.io/template.namespace'] ?? templateNamespace,
    cluster,
  );
  const { defaultCpu, defaultMemory } = templateDefaultsData ?? {};

  const cpuLimits = getCPULimitsFromVM(vm);
  const { unit: defaultMemoryUnit, value: defaultMemorySize } = defaultMemory ?? {};

  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);

  const handleSubmit = async (): Promise<void> => {
    setUpdateInProcess(true);
    setUpdateError(undefined);

    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      if (cpu) {
        ensurePath(vmDraft, 'spec.template.spec.domain.cpu');
        const domain = vmDraft.spec?.template?.spec?.domain;
        if (domain) {
          domain.cpu = cpu;
        }
      }

      if (memory && memoryUnit) {
        ensurePath(vmDraft, 'spec.template.spec.domain.memory.guest');
        const domainMemory = vmDraft.spec?.template?.spec?.domain?.memory;
        if (domainMemory) {
          domainMemory.guest = `${memory}${memoryUnit}`;
        }
      }
    });

    try {
      await onSubmit(updatedVM);

      setUpdateInProcess(false);
      onClose();
    } catch (error) {
      setUpdateInProcess(false);
      setUpdateError((error as Error)?.message ?? t('An error occurred while updating the VM'));
    }
  };

  return (
    <Modal
      className="cpu-memory-modal"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      width="650px"
    >
      <ModalHeader title={t('Edit CPU | Memory')} />
      <ModalBody>
        <div className="inputs">
          <CPUInput
            cpuLimits={cpuLimits}
            currentCPU={getCPU(vm)}
            setUserEnteredCPU={setCPU}
            userEnteredCPU={cpu}
          />
          <MemoryInput
            memory={memory}
            memoryUnit={memoryUnit}
            setMemory={setMemory}
            setMemoryUnit={setMemoryUnit}
          />
        </div>
        {updateError && (
          <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
            {updateError}
          </Alert>
        )}
      </ModalBody>
      <CPUMemoryModalFooter
        isRestoreDisabled={
          !templateName || !defaultsLoaded || !defaultCpu || !defaultMemory || !!defaultLoadError
        }
        isRestoreLoading={!!templateName && !defaultsLoaded}
        onClose={onClose}
        onRestoreTemplateSettings={() => {
          setCPU(defaultCpu);
          setMemory(defaultMemorySize);
          setMemoryUnit(defaultMemoryUnit);
        }}
        onSave={handleSubmit}
        updateInProcess={updateInProcess}
      />
    </Modal>
  );
};

export default CPUMemoryModal;
