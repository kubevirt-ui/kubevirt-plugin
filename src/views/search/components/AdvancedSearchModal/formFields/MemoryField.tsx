import React, { FC } from 'react';

import NumberTextInput from '@kubevirt-utils/components/NumberTextInput/NumberTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, InputGroup, InputGroupItem } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import NumberOperatorSelect from '../../../../../utils/components/NumberOperatorSelect/NumberOperatorSelect';
import MemoryUnitSelect from '../components/MemoryUnitSelect';
import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const MemoryField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue: setMemory, value: memory } = useAdvancedSearchField(
    VirtualMachineRowFilterType.Memory,
  );

  return (
    <FormGroup label={t('Memory')}>
      <InputGroup>
        <NumberOperatorSelect
          data-test="adv-search-mem-operator"
          onSelect={(operator) => setMemory({ ...memory, operator })}
          selected={memory.operator}
        />
        <InputGroupItem isFill>
          <NumberTextInput
            data-test="adv-search-mem-value"
            setValue={(value) => setMemory({ ...memory, value })}
            value={memory.value}
          />
        </InputGroupItem>
        <MemoryUnitSelect
          data-test="adv-search-mem-unit"
          onSelect={(unit) => setMemory({ ...memory, unit })}
          selected={memory.unit}
        />
      </InputGroup>
    </FormGroup>
  );
};

export default MemoryField;
