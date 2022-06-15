import * as React from 'react';
import produce from 'immer';
import { isCommonVMTemplate } from 'src/views/templates/utils';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  getCPUcores,
  getMemorySize,
  memorySizesTypes,
} from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { toIECUnit } from '@kubevirt-utils/utils/units';
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

import './cpu-memory-modal.scss';

type CPUMemoryModalProps = {
  template: V1Template;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVMTemplate: V1Template) => Promise<V1Template | void>;
};

const CPUMemoryModal: React.FC<CPUMemoryModalProps> = ({ template, isOpen, onClose, onSubmit }) => {
  const { t } = useKubevirtTranslation();
  const vm = getTemplateVirtualMachineObject(template);

  const isCommonTemplate = isCommonVMTemplate(template);
  const [updateInProcess, setUpdateInProcess] = React.useState<boolean>(false);
  const [updateError, setUpdateError] = React.useState<string>();

  const [memory, setMemory] = React.useState<number>();
  const [cpuCores, setCpuCores] = React.useState<number>();
  const [memoryUnit, setMemoryUnit] = React.useState<string>();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);

  const updatedTemplate = React.useMemo(() => {
    const updatedVMTemplate = produce<V1Template>(template, (templateDraft: V1Template) => {
      templateDraft.objects[0].spec.template.spec.domain.resources.requests = {
        ...vm?.spec?.template?.spec?.domain?.resources?.requests,
        memory: `${memory}${memoryUnit}`,
      };
      templateDraft.objects[0].spec.template.spec.domain.cpu.cores = cpuCores;
    });
    return updatedVMTemplate;
  }, [vm, memory, cpuCores, memoryUnit, template]);

  React.useEffect(() => {
    if (vm?.metadata) {
      const requests = vm?.spec?.template?.spec?.domain?.resources?.requests as {
        [key: string]: string;
      };
      const { size, unit } = getMemorySize(requests?.memory);
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
      title={t('Edit CPU | Memory')}
      isOpen={isOpen}
      className="cpu-memory-modal"
      variant={ModalVariant.small}
      onClose={onClose}
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.primary}
          onClick={handleSubmit}
          isDisabled={updateInProcess}
          isLoading={updateInProcess}
        >
          {t('Save')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      <div className="inputs">
        <div className="input-cpu">
          <Title headingLevel="h6" size={TitleSizes.md}>
            {t('CPUs')}
          </Title>
          <NumberInput
            isDisabled={isCommonTemplate}
            value={cpuCores}
            onMinus={() => setCpuCores((cpus) => +cpus - 1)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newNumber = +e?.target?.value;
              setCpuCores((cpus) => (newNumber > 0 ? newNumber : cpus));
            }}
            onPlus={() => setCpuCores((cpus) => +cpus + 1)}
            inputName="cpu-input"
            min={1}
          />
        </div>
        <div className="input-memory">
          <Title headingLevel="h6" size={TitleSizes.md}>
            {t('Memory')}
          </Title>
          <NumberInput
            isDisabled={isCommonTemplate}
            value={memory}
            onMinus={() => setMemory((mem) => +mem - 1)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newNumber = +e?.target?.value;
              setMemory((mem) => (newNumber > 0 ? newNumber : mem));
            }}
            onPlus={() => setMemory((mem) => +mem + 1)}
            inputName="memory-input"
            min={1}
          />

          <Dropdown
            selected
            className="input-memory--dropdown"
            onSelect={(e: React.ChangeEvent<HTMLInputElement>) => {
              setMemoryUnit(e?.target?.value);
              setIsDropdownOpen(false);
            }}
            toggle={
              <DropdownToggle onToggle={(toggeld) => setIsDropdownOpen(toggeld)}>
                {toIECUnit(memoryUnit)}
              </DropdownToggle>
            }
            isOpen={isDropdownOpen}
            dropdownItems={memorySizesTypes.map((value) => {
              return (
                <DropdownItem key={value} value={value} component="button">
                  {toIECUnit(value)}
                </DropdownItem>
              );
            })}
          />
        </div>
      </div>
      {updateError && (
        <Alert variant="danger" isInline title={t('Error')}>
          {updateError}
        </Alert>
      )}
    </Modal>
  );
};

export default CPUMemoryModal;
