import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const DescriptionField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Description);

  return (
    <FormGroup label={t('Description')}>
      <TextInput
        data-test="adv-search-vm-description"
        onChange={(_, newValue) => setValue(newValue)}
        type="text"
        value={value}
      />
    </FormGroup>
  );
};

export default DescriptionField;
