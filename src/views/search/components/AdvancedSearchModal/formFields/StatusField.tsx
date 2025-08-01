import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { statusFilterItems } from '@virtualmachines/list/utils/filters/getStatusFilter';

import MultiSelectTypeahead from '../../../../../utils/components/MultiSelectTypeahead/MultiSelectTypeahead';

type StatusFieldProps = {
  setStatuses: (statuses: string[]) => void;
  statuses: string[];
};

const StatusField: FC<StatusFieldProps> = ({ setStatuses, statuses }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup label={t('Status')}>
      <MultiSelectTypeahead
        allResourceNames={statusFilterItems?.map((item) => item.title)}
        data-test="adv-search-vm-status"
        selectedResourceNames={statuses}
        setSelectedResourceNames={setStatuses}
      />
    </FormGroup>
  );
};

export default StatusField;
