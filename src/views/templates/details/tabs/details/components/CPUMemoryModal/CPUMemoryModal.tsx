import React, { FC, useEffect, useMemo, useState } from 'react';
import produce from 'immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import CPUInput from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/CPUInput';
import CPUMemoryModalHeader from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/CPUMemoryModalHeader';
import MemoryInput from '@kubevirt-utils/components/CPUMemoryModal/components/MemoryInput/MemoryInput';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getCPUSockets, getMemory } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../../../hooks/useIsTemplateEditable';

import { getDefaultCPUMemoryValues } from './utils';

import '@kubevirt-utils/components/CPUMemoryModal/cpu-memory-modal.scss';

type CPUMemoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVMTemplate: V1Template) => Promise<V1Template | void>;
  template: V1Template;
};

const CPUMemoryModal: FC<CPUMemoryModalProps> = ({ isOpen, onClose, onSubmit, template }) => {
  const { t } = useKubevirtTranslation();

  const [updateInProcess, setUpdateInProcess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string>();

  const [cpuSockets, setCPUSockets] = useState<number>();
  const [memory, setMemory] = useState<number>();
  const [memoryUnit, setMemoryUnit] = useState<string>();

  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const vm = getTemplateVirtualMachineObject(template);

  const updatedTemplate = useMemo(
    () =>
      produce<V1Template>(template, (templateDraft: V1Template) => {
        const draftVM = getTemplateVirtualMachineObject(templateDraft);

        ensurePath(draftVM, [
          'spec.template.spec.domain.cpu',
          'spec.template.spec.domain.memory.guest',
        ]);

        draftVM.spec.template.spec.domain.cpu.sockets = cpuSockets;
        draftVM.spec.template.spec.domain.memory.guest = `${memory}${memoryUnit}`;
      }),
    [memory, cpuSockets, memoryUnit, template],
  );

  useEffect(() => {
    if (isEmpty(vm?.metadata)) return;

    const { size, unit } = getMemorySize(getMemory(vm));
    setMemoryUnit(unit);
    setMemory(size);
    setCPUSockets(getCPUSockets(vm));
  }, [vm]);

  const handleSubmit = async () => {
    setUpdateInProcess(true);
    setUpdateError(null);

    try {
      await onSubmit(updatedTemplate);

      setUpdateInProcess(false);
      onClose();
    } catch (error) {
      setUpdateInProcess(false);
      setUpdateError(error.message);
    }
  };

  const { defaultCPU, defaultMemory } = getDefaultCPUMemoryValues(template);
  const { defaultMemorySize, defaultMemoryUnit } = defaultMemory;

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
          onClick={() => {
            setCPUSockets(defaultCPU?.sockets);
            setMemory(defaultMemorySize);
            setMemoryUnit(defaultMemoryUnit);
          }}
          isDisabled={!isTemplateEditable}
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
