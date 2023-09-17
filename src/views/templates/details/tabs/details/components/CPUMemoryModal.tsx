import * as React from 'react';
import produce from 'immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  getMemorySize,
  memorySizesTypes,
} from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getCPUcores, getMemory } from '@kubevirt-utils/resources/vm';
import { toIECUnit } from '@kubevirt-utils/utils/units';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Modal,
  ModalVariant,
  NumberInput,
  Title,
  TitleSizes,
} from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../../hooks/useIsTemplateEditable';

import './cpu-memory-modal.scss';

type CPUMemoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVMTemplate: V1Template) => Promise<V1Template | void>;
  template: V1Template;
};

const CPUMemoryModal: React.FC<CPUMemoryModalProps> = ({ isOpen, onClose, onSubmit, template }) => {
  const { t } = useKubevirtTranslation();
  const vm = getTemplateVirtualMachineObject(template);

  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const [updateInProcess, setUpdateInProcess] = React.useState<boolean>(false);
  const [updateError, setUpdateError] = React.useState<string>();

  const [memory, setMemory] = React.useState<number>();
  const [cpuCores, setCpuCores] = React.useState<number>();
  const [memoryUnit, setMemoryUnit] = React.useState<string>();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);

  const updatedTemplate = React.useMemo(
    () =>
      produce<V1Template>(template, (templateDraft: V1Template) => {
        const draftVM = getTemplateVirtualMachineObject(templateDraft);

        ensurePath(draftVM, [
          'spec.template.spec.domain.cpu',
          'spec.template.spec.domain.memory.guest',
        ]);

        draftVM.spec.template.spec.domain.cpu.cores = cpuCores;
        draftVM.spec.template.spec.domain.memory.guest = `${memory}${memoryUnit}`;
      }),
    [memory, cpuCores, memoryUnit, template],
  );

  React.useEffect(() => {
    if (vm?.metadata) {
      const { size, unit } = getMemorySize(getMemory(vm));
      setMemoryUnit(unit);
      setMemory(size);
      setCpuCores(getCPUcores(vm));
    }
  }, [vm, template]);

  const handleSubmit = () => {
    setUpdateInProcess(true);
    setUpdateError(null);

    onSubmit(updatedTemplate)
      .then(() => {
        setUpdateInProcess(false);
        onClose();
      })
      .catch((err) => {
        setUpdateInProcess(false);
        setUpdateError(err.message);
      });
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
        <Button key="cancel" onClick={onClose} variant="link">
          {t('Cancel')}
        </Button>,
      ]}
      className="cpu-memory-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={t('Edit CPU | Memory')}
      variant={ModalVariant.small}
    >
      <div className="inputs">
        <div className="input-cpu">
          <Title headingLevel="h6" size={TitleSizes.md}>
            {t('CPUs')}
          </Title>
          <NumberInput
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newNumber = +e?.target?.value;
              setCpuCores((cpus) => (newNumber > 0 ? newNumber : cpus));
            }}
            inputName="cpu-input"
            isDisabled={!isTemplateEditable}
            min={1}
            onMinus={() => setCpuCores((cpus) => +cpus - 1)}
            onPlus={() => setCpuCores((cpus) => +cpus + 1)}
            value={cpuCores}
          />
        </div>
        <div className="input-memory">
          <Title headingLevel="h6" size={TitleSizes.md}>
            {t('Memory')}
          </Title>
          <NumberInput
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newNumber = +e?.target?.value;
              setMemory((mem) => (newNumber > 0 ? newNumber : mem));
            }}
            inputName="memory-input"
            isDisabled={!isTemplateEditable}
            min={1}
            onMinus={() => setMemory((mem) => +mem - 1)}
            onPlus={() => setMemory((mem) => +mem + 1)}
            value={memory}
          />

          <Dropdown
            dropdownItems={memorySizesTypes.map((value) => {
              return (
                <DropdownItem component="button" key={value} value={value}>
                  {toIECUnit(value)}
                </DropdownItem>
              );
            })}
            onSelect={(e: React.ChangeEvent<HTMLInputElement>) => {
              setMemoryUnit(e?.target?.value);
              setIsDropdownOpen(false);
            }}
            toggle={
              <DropdownToggle onToggle={(toggeld) => setIsDropdownOpen(toggeld)}>
                {toIECUnit(memoryUnit)}
              </DropdownToggle>
            }
            className="input-memory--dropdown"
            isOpen={isDropdownOpen}
            selected
          />
        </div>
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
