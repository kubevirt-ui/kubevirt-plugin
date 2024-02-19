import React, { ChangeEvent, FC, MouseEvent, useEffect, useMemo, useState } from 'react';
import produce from 'immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  getMemorySize,
  memorySizesTypes,
} from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getCPUcores, getMemory } from '@kubevirt-utils/resources/vm';
import { toIECUnit } from '@kubevirt-utils/utils/units';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { NumberInput, SelectOption, Title, TitleSizes } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../../hooks/useIsTemplateEditable';

type CPUMemoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVMTemplate: V1Template) => Promise<V1Template | void>;
  template: V1Template;
};

const CPUMemoryModal: FC<CPUMemoryModalProps> = ({ isOpen, onClose, onSubmit, template }) => {
  const { t } = useKubevirtTranslation();
  const vm = getTemplateVirtualMachineObject(template);

  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const [memory, setMemory] = useState<number>();
  const [cpuCores, setCpuCores] = useState<number>();
  const [memoryUnit, setMemoryUnit] = useState<string>();

  const updatedTemplate = useMemo(
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

  useEffect(() => {
    if (vm?.metadata) {
      const { size, unit } = getMemorySize(getMemory(vm));
      setMemoryUnit(unit);
      setMemory(size);
      setCpuCores(getCPUcores(vm));
    }
  }, [vm]);

  return (
    <TabModal
      headerText={t('Edit CPU | Memory')}
      isOpen={isOpen}
      obj={updatedTemplate}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className="inputs">
        <div className="input-cpu">
          <Title headingLevel="h6" size={TitleSizes.md}>
            {t('CPUs')}
          </Title>
          <NumberInput
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
          <FormPFSelect
            className="input-memory--dropdown"
            onSelect={(e: MouseEvent<HTMLInputElement>, value: string) => setMemoryUnit(value)}
            selected={memoryUnit}
            selectedLabel={toIECUnit(memoryUnit)}
          >
            {memorySizesTypes.map((value) => {
              const iecUnit = toIECUnit(value);
              return (
                <SelectOption key={value} value={value}>
                  {iecUnit}
                </SelectOption>
              );
            })}
          </FormPFSelect>
        </div>
      </div>
    </TabModal>
  );
};

export default CPUMemoryModal;
