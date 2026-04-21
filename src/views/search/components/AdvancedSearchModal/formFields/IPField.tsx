import React, { FC } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { isValidIPSubstring } from '@search/utils/validation';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const IPField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.IP);

  const isValid = isValidIPSubstring(value);
  const validated = isValid ? ValidatedOptions.default : ValidatedOptions.warning;

  return (
    <FormGroup label={t('IP address')}>
      <TextInput
        data-test="adv-search-vm-ip"
        onChange={(_, newValue) => setValue(newValue)}
        type="text"
        validated={validated}
        value={value}
      />
      {!isValid && (
        <FormGroupHelperText validated={validated}>
          {t('Invalid IP address. No VirtualMachines will be found.')}
        </FormGroupHelperText>
      )}
    </FormGroup>
  );
};

export default IPField;
