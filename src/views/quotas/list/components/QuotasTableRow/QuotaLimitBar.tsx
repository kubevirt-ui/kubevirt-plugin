import React from 'react';
import { ResourceInfo } from 'src/views/quotas/form/types';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { HelperText, HelperTextItem, Progress } from '@patternfly/react-core';

type QuotaLimitBarProps = {
  fieldKey: string;
  hard: ResourceInfo;
  unit: string;
  used: ResourceInfo;
};

const QuotaLimitBar: React.FC<QuotaLimitBarProps> = ({ fieldKey, hard, unit, used }) => {
  if (!hard?.[fieldKey]) {
    return <span className="pf-v6-u-text-color-subtle">{NO_DATA_DASH}</span>;
  }

  const hardValue = parseInt(hard[fieldKey]);
  const usedValue = parseInt(used[fieldKey]);

  return (
    <div>
      <Progress measureLocation="none" size="sm" value={(usedValue / hardValue) * 100} />
      <HelperText className="pf-v6-u-mt-xs">
        <HelperTextItem>
          {usedValue} / {hardValue} {unit}
        </HelperTextItem>
      </HelperText>
    </div>
  );
};

export default QuotaLimitBar;
