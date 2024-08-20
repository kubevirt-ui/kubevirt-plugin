import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';

import { memorySizesTypes } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { toIECUnit } from '@kubevirt-utils/utils/units';
import { NumberInput, SelectList, SelectOption, Title, TitleSizes } from '@patternfly/react-core';

import './MemoryInput.scss';

type MemoryInputProps = {
  memory: number;
  memoryUnit: string;
  setMemory: Dispatch<SetStateAction<number>>;
  setMemoryUnit: Dispatch<SetStateAction<string>>;
};

const MemoryInput: FC<MemoryInputProps> = ({ memory, memoryUnit, setMemory, setMemoryUnit }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="input-memory">
      <Title className="input-memory__title" headingLevel="h6" size={TitleSizes.md}>
        {t('Memory')}
      </Title>
      <NumberInput
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newNumber = +e?.target?.value;
          setMemory((mem) => (newNumber > 0 ? newNumber : mem));
        }}
        inputName="memory-input"
        min={1}
        onMinus={() => setMemory((mem) => +mem - 1)}
        onPlus={() => setMemory((mem) => +mem + 1)}
        value={memory}
      />

      <FormPFSelect
        selected={memoryUnit}
        selectedLabel={toIECUnit(memoryUnit)}
        toggleProps={{ className: 'input-memory--dropdown' }}
      >
        <SelectList>
          {memorySizesTypes.map((value: string) => (
            <SelectOption key={value} onClick={() => setMemoryUnit(value)} value={value}>
              {toIECUnit(value)}
            </SelectOption>
          ))}
        </SelectList>
      </FormPFSelect>
    </div>
  );
};

export default MemoryInput;
