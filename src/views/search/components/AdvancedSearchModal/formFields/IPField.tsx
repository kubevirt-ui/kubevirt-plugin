import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const IPField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.IP);

  return (
    <FormGroup label={t('IP address')}>
      <TextInput
        data-test="adv-search-vm-ip"
        onChange={(_, newValue) => setValue(newValue)}
        type="text"
        value={value}
      />
    </FormGroup>
  );
};

export default IPField;
