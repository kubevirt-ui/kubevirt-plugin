import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';
import { SchedulingValue } from '@search/utils/types';

type SchedulingFieldProps = {
  scheduling: SchedulingValue;
  setScheduling: Dispatch<SetStateAction<SchedulingValue>>;
};

const SchedulingField: FC<SchedulingFieldProps> = ({ scheduling, setScheduling }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup isInline label={t('Scheduling')} role="group">
      <Checkbox
        onChange={(_, checked) =>
          setScheduling((previous) => ({ ...previous, affinityRules: checked }))
        }
        id="adv-search-vm-scheduling-affinity-rules"
        isChecked={scheduling.affinityRules}
        label={t('Affinity rules')}
      />
      <Checkbox
        onChange={(_, checked) =>
          setScheduling((previous) => ({ ...previous, nodeSelector: checked }))
        }
        id="adv-search-vm-scheduling-node-selector"
        isChecked={scheduling.nodeSelector}
        label={t('Node selector')}
      />
    </FormGroup>
  );
};

export default SchedulingField;
