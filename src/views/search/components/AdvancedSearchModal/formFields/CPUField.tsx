import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, InputGroup, InputGroupItem } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import NumberOperatorSelect from '../../../../../utils/components/NumberOperatorSelect/NumberOperatorSelect';
import NumberInput from '../components/NumberInput';
import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const CPUField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue: setVCPU, value: vCPU } = useAdvancedSearchField(
    VirtualMachineRowFilterType.CPU,
  );

  return (
    <FormGroup label={t('vCPU')}>
      <InputGroup>
        <NumberOperatorSelect
          data-test="adv-search-vcpu-operator"
          onSelect={(operator) => setVCPU({ ...vCPU, operator })}
          selected={vCPU.operator}
        />
        <InputGroupItem isFill>
          <NumberInput
            data-test="adv-search-vcpu-value"
            setValue={(value) => setVCPU({ ...vCPU, value })}
            value={vCPU.value}
          />
        </InputGroupItem>
      </InputGroup>
    </FormGroup>
  );
};

export default CPUField;
