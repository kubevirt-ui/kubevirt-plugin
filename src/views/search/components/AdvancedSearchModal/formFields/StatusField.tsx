import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { STATUS_LIST, VirtualMachineRowFilterType } from '@virtualmachines/utils';

import MultiSelectTypeahead from '../../../../../utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const StatusField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Status);

  return (
    <FormGroup label={t('Status')}>
      <MultiSelectTypeahead
        allResourceNames={STATUS_LIST}
        selectedResourceNames={value}
        setSelectedResourceNames={setValue}
      />
    </FormGroup>
  );
};

export default StatusField;
