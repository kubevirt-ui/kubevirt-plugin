import React, { FC, useEffect, useMemo, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUInput from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/CPUInput';
import CPUMemoryModalHeader from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/CPUMemoryModalHeader';
import MemoryInput from '@kubevirt-utils/components/CPUMemoryModal/components/MemoryInput/MemoryInput';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import {
  getCPU,
  getCPULimit,
  getCPURequest,
  getCPUSockets,
  getMemory,
  getMemoryLimit,
  getMemoryRequest,
  VM_TEMPLATE_ANNOTATION,
} from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Alert, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { updateVMResources } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import useTemplateDefaultCpuMemory from './hooks/useTemplateDefaultCpuMemory';
import { getMemorySize } from './utils/CpuMemoryUtils';

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
  const {
    data: templateDefaultsData,
    error: defaultLoadError,
    loaded: defaultsLoaded,
  } = useTemplateDefaultCpuMemory(
    vm?.metadata?.labels?.['vm.kubevirt.io/template'],
    vm?.metadata?.labels?.['vm.kubevirt.io/template.namespace'] || templateNamespace,
  );
  const [updateInProcess, setUpdateInProcess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string>();

  const [memory, setMemory] = useState<number>();
  const [cpuSockets, setCPUSockets] = useState<number>();
  const [memoryUnit, setMemoryUnit] = useState<string>();

  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, [
        'spec.template.spec.domain.cpu',
        'spec.template.spec.domain.memory.guest',
      ]);

      const memoryValue = `${memory}${memoryUnit}`;
      const numCPUs = cpuSockets * getCPU(vm)?.cores * getCPU(vm)?.threads;

      vmDraft.spec.template.spec.domain.cpu.sockets = cpuSockets;
      vmDraft.spec.template.spec.domain.memory.guest = `${memory}${memoryUnit}`;

      if (getMemoryRequest(vmDraft) && getMemoryLimit(vmDraft)) {
        vmDraft.spec.template.spec.domain.resources.requests['memory'] = memoryValue;
        vmDraft.spec.template.spec.domain.resources.limits['memory'] = memoryValue;
      }

      if (getCPURequest(vmDraft) && getCPULimit(vmDraft)) {
        vmDraft.spec.template.spec.domain.resources.requests['memory'] = numCPUs;
        vmDraft.spec.template.spec.domain.resources.limits['memory'] = numCPUs;
      }
    });

    return updatedVM;
  }, [vm, memory, cpuSockets, memoryUnit]);

  useEffect(() => {
    if (vm?.metadata) {
      const { size, unit } = getMemorySize(getMemory(vm));
      setMemoryUnit(unit);
      setMemory(size);
      setCPUSockets(getCPUSockets(vm));
    }
  }, [vm]);

  const handleSubmit = async () => {
    setUpdateInProcess(true);
    setUpdateError(null);

    try {
      await updateVMResources(updatedVirtualMachine);
      await onSubmit(updatedVirtualMachine);

      setUpdateInProcess(false);
      onClose();
    } catch (error) {
      setUpdateInProcess(false);
      setUpdateError(error.message);
    }
  };

  return (
    <Modal
      actions={[
        <Button
          isDisabled={updateInProcess}
          isLoading={updateInProcess}
          key="confirm"
          onClick={handleSubmit}
          variant={ButtonVariant.primary}
        >
          {t('Save')}
        </Button>,
        <Button
          isDisabled={
            !templateName ||
            !defaultsLoaded ||
            !templateDefaultsData?.defaultCpu ||
            !templateDefaultsData?.defaultMemory ||
            defaultLoadError
          }
          onClick={() => {
            setCPUSockets(templateDefaultsData?.defaultCpu);
            setMemory(templateDefaultsData?.defaultMemory?.size);
            setMemoryUnit(templateDefaultsData?.defaultMemory?.unit);
          }}
          isLoading={templateName && !defaultsLoaded}
          key="default"
          variant={ButtonVariant.secondary}
        >
          {t('Restore template settings')}
        </Button>,
        <Button key="cancel" onClick={onClose} variant="link">
          {t('Cancel')}
        </Button>,
      ]}
      className="cpu-memory-modal"
      header={<CPUMemoryModalHeader />}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
    >
      <div className="inputs">
        <CPUInput cpuSockets={cpuSockets} setCPUSockets={setCPUSockets} vm={vm} />
        <MemoryInput
          memory={memory}
          memoryUnit={memoryUnit}
          setMemory={setMemory}
          setMemoryUnit={setMemoryUnit}
        />
      </div>
      {updateError && (
        <Alert isInline title={t('Error')} variant="danger">
          {updateError}
        </Alert>
      )}
    </Modal>
  );
};

export default CPUMemoryModal;
