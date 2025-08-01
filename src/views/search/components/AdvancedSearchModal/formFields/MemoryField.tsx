import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, InputGroup, InputGroupItem } from '@patternfly/react-core';
import { MemoryValue } from '@search/utils/types';

import NumberOperatorSelect from '../../../../../utils/components/NumberOperatorSelect/NumberOperatorSelect';
import MemoryUnitSelect from '../components/MemoryUnitSelect';
import NumberInput from '../components/NumberInput';

type MemoryFieldProps = {
  memory: MemoryValue;
  setMemory: Dispatch<SetStateAction<MemoryValue>>;
};

const MemoryField: FC<MemoryFieldProps> = ({ memory, setMemory }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup label={t('Memory')}>
      <InputGroup>
        <NumberOperatorSelect
          data-test="adv-search-mem-operator"
          onSelect={(operator) => setMemory((previous) => ({ ...previous, operator }))}
          selected={memory.operator}
        />
        <InputGroupItem isFill>
          <NumberInput
            data-test="adv-search-mem-value"
            setValue={(value) => setMemory((previous) => ({ ...previous, value }))}
            value={memory.value}
          />
        </InputGroupItem>
        <MemoryUnitSelect
          data-test="adv-search-mem-unit"
          onSelect={(unit) => setMemory((previous) => ({ ...previous, unit }))}
          selected={memory.unit}
        />
      </InputGroup>
    </FormGroup>
  );
};

export default MemoryField;
