import React, { type FC, useEffect, useMemo, useState } from 'react';
import produce from 'immer';

import { type V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CPUInput from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/CPUInput';
import { getCPULimitsFromTemplate } from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import MemoryInput from '@kubevirt-utils/components/CPUMemoryModal/components/MemoryInput/MemoryInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { toQuantity } from '@kubevirt-utils/utils/units';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../../../hooks/useIsTemplateEditable';
import { getDefaultCPUMemoryValues } from './utils';

import '@kubevirt-utils/components/CPUMemoryModal/cpu-memory-modal.scss';

type CPUMemoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVMTemplate: Template) => Promise<Template | void>;
  template: Template;
};

const CPUMemoryModal: FC<CPUMemoryModalProps> = ({ isOpen, onClose, onSubmit, template }) => {
  const { t } = useKubevirtTranslation();
  const vm = useMemo(() => getTemplateVirtualMachineObject(template), [template]);

  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const [cpu, setCPU] = useState<V1CPU>(() => getCPU(vm));
  const [memory, setMemory] = useState<number>();
  const [memoryUnit, setMemoryUnit] = useState<string>();

  const [updateInProcess, setUpdateInProcess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string>();

  const handleSubmit = async (): Promise<void> => {
    setUpdateInProcess(true);
    setUpdateError(null);

    const updatedTemplate = produce<Template>(template, (templateDraft: Template) => {
      const draftVM = getTemplateVirtualMachineObject(templateDraft);

      ensurePath(draftVM, [
        'spec.template.spec.domain.cpu',
        'spec.template.spec.domain.memory.guest',
      ]);

      draftVM.spec.template.spec.domain.cpu = cpu;
      draftVM.spec.template.spec.domain.memory.guest = `${memory}${memoryUnit ?? ''}`;
    });

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

  const cpuLimits = getCPULimitsFromTemplate(template);

  useEffect(() => {
    if (vm?.metadata) {
      const memoryQuantity = toQuantity(getMemory(vm));
      const { unit: memUnit, value: memSize } = memoryQuantity ?? {};
      setMemoryUnit(memUnit);
      setMemory(memSize);
      setCPU(getCPU(vm));
    }
  }, [vm]);

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
            currentCPU={defaultCPU}
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
      <ModalFooter>
        <Button
          data-test="save-button"
          isDisabled={updateInProcess}
          isLoading={updateInProcess}
          key="confirm"
          onClick={handleSubmit}
        >
          {t('Save')}
        </Button>
        <Button
          data-test="restore-button"
          isDisabled={isTemplateEditable}
          key="default"
          onClick={() => {
            setCPU(defaultCPU);
            setMemory(defaultMemorySize);
            setMemoryUnit(defaultMemoryUnit);
          }}
          variant={ButtonVariant.secondary}
        >
          {t('Restore template settings')}
        </Button>
        <Button
          data-test="cancel-button"
          key="cancel"
          onClick={onClose}
          variant={ButtonVariant.link}
        >
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CPUMemoryModal;
