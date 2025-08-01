import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, InputGroup, InputGroupItem } from '@patternfly/react-core';
import { CPUValue } from '@search/utils/types';

import NumberOperatorSelect from '../../../../../utils/components/NumberOperatorSelect/NumberOperatorSelect';
import NumberInput from '../components/NumberInput';

type CPUFieldProps = {
  setVCPU: Dispatch<SetStateAction<CPUValue>>;
  vCPU: CPUValue;
};

const CPUField: FC<CPUFieldProps> = ({ setVCPU, vCPU }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup label={t('vCPU')}>
      <InputGroup>
        <NumberOperatorSelect
          data-test="adv-search-vcpu-operator"
          onSelect={(operator) => setVCPU((previous) => ({ ...previous, operator }))}
          selected={vCPU.operator}
        />
        <InputGroupItem isFill>
          <NumberInput
            data-test="adv-search-vcpu-value"
            setValue={(value) => setVCPU((previous) => ({ ...previous, value }))}
            value={vCPU.value}
          />
        </InputGroupItem>
      </InputGroup>
    </FormGroup>
  );
};

export default CPUField;
