import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const GuestAgentField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.GuestAgent);

  return (
    <FormGroup isInline label={t('Guest agent')} role="group">
      <Checkbox
        id="adv-search-guest-agent-reporting"
        isChecked={value.reporting}
        label={t('Reporting')}
        onChange={(_, checked) => setValue({ ...value, reporting: checked })}
      />
      <Checkbox
        id="adv-search-guest-agent-not-reporting"
        isChecked={value.notReporting}
        label={t('Not reporting')}
        onChange={(_, checked) => setValue({ ...value, notReporting: checked })}
      />
    </FormGroup>
  );
};

export default GuestAgentField;
