import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import useGroupsWithVMs from '../hooks/useGroupsWithVMs';
import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

type GroupFieldProps = {
  vms: V1VirtualMachine[];
};

const GroupField: FC<GroupFieldProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Group);

  const allGroupNames = useGroupsWithVMs(vms);

  return (
    <FormGroup label={t('Group')}>
      <MultiSelectTypeahead
        allResourceNames={allGroupNames}
        data-test="adv-search-vm-group"
        emptyValuePlaceholder={t('All groups')}
        selectedResourceNames={value}
        selectPlaceholder={t('Select group')}
        setSelectedResourceNames={setValue}
      />
    </FormGroup>
  );
};

export default GroupField;
