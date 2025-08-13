import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const NameField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Name);

  return (
    <FormGroup label={t('Name')}>
      <TextInput
        data-test="adv-search-vm-name"
        onChange={(_, newValue) => setValue(newValue)}
        type="text"
        value={value}
      />
    </FormGroup>
  );
};

export default NameField;
