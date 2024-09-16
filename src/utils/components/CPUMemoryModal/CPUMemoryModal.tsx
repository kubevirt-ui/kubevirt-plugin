import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';
import produce from 'immer';

import { V1CPU, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUInput from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/CPUInput';
import MemoryInput from '@kubevirt-utils/components/CPUMemoryModal/components/MemoryInput/MemoryInput';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { getCPU, getMemory, VM_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';

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

  const [updateInProcess, setUpdateInProcess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string>();

  const { size, unit } = getMemorySize(getMemory(vm));
  const [memory, setMemory] = useState<number>(size || undefined);
  const [memoryUnit, setMemoryUnit] = useState<string>(unit || undefined);
  const [cpu, setCPU] = useState<V1CPU>(getCPU(vm));

  const {
    data: templateDefaultsData,
    error: defaultLoadError,
    loaded: defaultsLoaded,
  } = useTemplateDefaultCpuMemory(
    vm?.metadata?.labels?.['vm.kubevirt.io/template'],
    vm?.metadata?.labels?.['vm.kubevirt.io/template.namespace'] || templateNamespace,
  );
  const { defaultCpu, defaultMemory } = templateDefaultsData || {};
  const { size: defaultMemorySize, unit: defaultMemoryUnit } = defaultMemory || {};

  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);

  const handleSubmit = async () => {
    setUpdateInProcess(true);
    setUpdateError(null);

    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, [
        'spec.template.spec.domain.cpu',
        'spec.template.spec.domain.memory.guest',
      ]);

      vmDraft.spec.template.spec.domain.cpu = cpu;
      vmDraft.spec.template.spec.domain.memory.guest = `${memory}${memoryUnit}`;
    });

    try {
      await onSubmit(updatedVM);

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
            !templateName || !defaultsLoaded || !defaultCpu || !defaultMemory || defaultLoadError
          }
          onClick={() => {
            setCPU(defaultCpu);
            setMemory(defaultMemorySize);
            setMemoryUnit(defaultMemoryUnit);
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
      isOpen={isOpen}
      onClose={onClose}
      title={t('Edit CPU | Memory')}
      variant={ModalVariant.small}
      width="650px"
    >
      <Alert
        title={
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            Updates to the sockets value are applied immediately.{<br />}To apply changes to the
            cores or threads values, you must restart the VirtualMachine.
          </Trans>
        }
        isInline
        variant={AlertVariant.info}
      />
      <div className="inputs">
        <CPUInput currentCPU={getCPU(vm)} setUserEnteredCPU={setCPU} userEnteredCPU={cpu} />
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
