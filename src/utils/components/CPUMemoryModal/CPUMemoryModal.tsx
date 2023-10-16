import React, { FC, useEffect, useMemo, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUInput from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/CPUInput';
import CPUMemoryModalHeader from '@kubevirt-utils/components/CPUMemoryModal/components/CPUMemoryModalHeader';
import MaxCPUSocketsExceededAlert from '@kubevirt-utils/components/CPUMemoryModal/components/MaxCPUSocketsExceededAlert';
import MaxMemoryExceededAlert from '@kubevirt-utils/components/CPUMemoryModal/components/MaxMemoryExceededAlert';
import MemoryInput from '@kubevirt-utils/components/CPUMemoryModal/components/MemoryInput/MemoryInput';
import { MAX_CPU_SOCKETS } from '@kubevirt-utils/components/CPUMemoryModal/utils/constants';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { CPU_HOT_PLUG_ENABLED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { getCPUSockets, getMemory, VM_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { isCreatedFromTemplate } from '@kubevirt-utils/utils/vm-utils';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import useTemplateDefaultCPUMemory from './hooks/useTemplateDefaultCPUMemory';
import { getMemorySize, requestedMemExceedsMaxMemory } from './utils/CpuMemoryUtils';

import './CPUMemoryModal.scss';

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
  const { featureEnabled: cpuHotPlugEnabled } = useFeatures(CPU_HOT_PLUG_ENABLED);

  const {
    data: templateDefaultsData,
    error: defaultLoadError,
    loaded: defaultsLoaded,
  } = useTemplateDefaultCPUMemory(
    vm?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME],
    vm?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAMESPACE] || templateNamespace,
  );
  const [updateInProcess, setUpdateInProcess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string>();

  const [cpuSockets, setCPUSockets] = useState<number>();

  const [memory, setMemory] = useState<number>();
  const [memoryUnit, setMemoryUnit] = useState<string>();
  const [maxMemoryExceeded, setMaxMemoryExceeded] = useState<boolean>(false);

  useEffect(() => {
    const maxExceeded = requestedMemExceedsMaxMemory(memory, memoryUnit);
    setMaxMemoryExceeded(maxExceeded);
  }, [memory, memoryUnit]);

  const showPendingChangesAlert = isRunning(vm) && !cpuHotPlugEnabled && !isCreatedFromTemplate(vm);

  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, [
        'spec.template.spec.domain.cpu',
        'spec.template.spec.domain.memory.guest',
      ]);

      vmDraft.spec.template.spec.domain.cpu.sockets = cpuSockets;
      vmDraft.spec.template.spec.domain.memory.guest = `${memory}${memoryUnit}`;
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
      await onSubmit(updatedVirtualMachine);

      setUpdateInProcess(false);
      onClose();
    } catch (error) {
      setUpdateInProcess(false);
      setUpdateError(error.message);
    }
  };

  const maxCPUSocketsExceeded = cpuSockets > MAX_CPU_SOCKETS;

  return (
    <Modal
      actions={[
        <Button
          isDisabled={updateInProcess || maxCPUSocketsExceeded || maxMemoryExceeded}
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
      {showPendingChangesAlert && <ModalPendingChangesAlert />}
      <div className="inputs">
        <CPUInput cpuSockets={cpuSockets} setCPUSockets={setCPUSockets} />
        <MemoryInput
          memory={memory}
          memoryUnit={memoryUnit}
          setMemory={setMemory}
          setMemoryUnit={setMemoryUnit}
        />
      </div>
      {maxCPUSocketsExceeded && <MaxCPUSocketsExceededAlert cpuSockets={cpuSockets} />}
      {maxMemoryExceeded && <MaxMemoryExceededAlert memory={memory} memoryUnit={memoryUnit} />}
      {updateError && (
        <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
          {updateError}
        </Alert>
      )}
    </Modal>
  );
};

export default CPUMemoryModal;
