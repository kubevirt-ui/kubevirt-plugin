import React, { FC } from 'react';
import { getQuotaNumbers, getResourceKeyKind } from 'src/views/quotas/utils/utils';

import { ResourceInfo } from '@kubevirt-utils/resources/quotas/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { HelperText, HelperTextItem, Progress } from '@patternfly/react-core';

import { getCountString, getProgressVariant } from './utils';

import './QuotaLimitBar.scss';

type QuotaLimitBarProps = {
  hard: ResourceInfo;
  resourceKey: string;
  unit: string;
  used: ResourceInfo;
};

const QuotaLimitBar: FC<QuotaLimitBarProps> = ({ hard, resourceKey, unit, used: usedValue }) => {
  if (!hard?.[resourceKey]) {
    return <span className="pf-v6-u-text-color-subtle">{NO_DATA_DASH}</span>;
  }

  const { max, percentage, used } = getQuotaNumbers(usedValue[resourceKey], hard[resourceKey]);

  const progressVariant = getProgressVariant(percentage);
  const resourceKeyKind = getResourceKeyKind(resourceKey);

  return (
    <div>
      <Progress
        className="quota-limit-bar__progress"
        measureLocation="none"
        size="sm"
        value={percentage}
        variant={progressVariant}
      />
      <HelperText className="pf-v6-u-mt-xs">
        <HelperTextItem>
          {getCountString(used, resourceKeyKind)} / {getCountString(max, resourceKeyKind)} {unit}
        </HelperTextItem>
      </HelperText>
    </div>
  );
};

export default QuotaLimitBar;
