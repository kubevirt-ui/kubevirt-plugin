import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const SchedulingField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Scheduling);

  return (
    <FormGroup isInline label={t('Scheduling')} role="group">
      <Checkbox
        id="adv-search-vm-scheduling-affinity-rules"
        isChecked={value.affinityRules}
        label={t('Affinity rules')}
        onChange={(_, checked) => setValue({ ...value, affinityRules: checked })}
      />
      <Checkbox
        id="adv-search-vm-scheduling-node-selector"
        isChecked={value.nodeSelector}
        label={t('Node selector')}
        onChange={(_, checked) => setValue({ ...value, nodeSelector: checked })}
      />
    </FormGroup>
  );
};

export default SchedulingField;
