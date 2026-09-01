import React, { type FC, type FormEvent } from 'react';

import { MEMORY_UNITS } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type QuantityUnit } from '@kubevirt-utils/utils/unitConstants';
import { addByteSuffix } from '@kubevirt-utils/utils/units';
import {
  Button,
  ButtonVariant,
  NumberInput,
  SelectOption,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { DEFAULT_MEMORY, DEFAULT_MEMORY_UNIT } from './constants';

import './MemoryInput.scss';

type MemoryInputProps = {
  memory: number | undefined;
  memoryUnit: QuantityUnit | undefined;
  setMemory: (memory: number) => void;
  setMemoryUnit: (memoryUnit: QuantityUnit) => void;
};

const MemoryInput: FC<MemoryInputProps> = ({ memory, memoryUnit, setMemory, setMemoryUnit }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="input-memory">
      <Title className="input-memory__title" headingLevel="h6" size={TitleSizes.md}>
        {t('Memory')}
      </Title>
      {memory && memoryUnit ? (
        <>
          <NumberInput
            inputName="memory-input"
            min={1}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              const newNumber = +e.currentTarget.value;
              setMemory(newNumber > 0 ? newNumber : memory);
            }}
            onMinus={() => setMemory(memory - 1)}
            onPlus={() => setMemory(memory + 1)}
            value={memory}
            widthChars={1}
          />
          <FormPFSelect
            selected={memoryUnit}
            selectedLabel={addByteSuffix(String(memoryUnit))}
            toggleProps={{ className: 'input-memory__dropdown' }}
          >
            {MEMORY_UNITS.map((value) => (
              <SelectOption key={value} onClick={() => setMemoryUnit(value)} value={value}>
                {addByteSuffix(value)}
              </SelectOption>
            ))}
          </FormPFSelect>
        </>
      ) : (
        <Button
          icon={<PlusCircleIcon />}
          onClick={() => {
            setMemory(DEFAULT_MEMORY);
            setMemoryUnit(DEFAULT_MEMORY_UNIT);
          }}
          variant={ButtonVariant.link}
        >
          {t('Add memory')}
        </Button>
      )}
    </div>
  );
};

export default MemoryInput;
