import type { FC } from 'react';
import React from 'react';

import type { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';

import { QUOTA_UNITS } from '../../utils/constants';
import QuotaLimitBar from '../components/QuotaLimitBar/QuotaLimitBar';
import type { QuotaCallbacks } from '../utils/helpers';
import { getQuotaStatusData, getResourceKeysFromCallbacks } from '../utils/helpers';

type QuotaVMICountCellProps = {
  callbacks: QuotaCallbacks;
  row: ApplicationAwareQuota;
};

const QuotaVMICountCell: FC<QuotaVMICountCellProps> = ({ callbacks, row }) => {
  const { vmiCount } = getResourceKeysFromCallbacks(callbacks);
  const { hard, used } = getQuotaStatusData(row);

  return (
    <QuotaLimitBar hard={hard} resourceKey={vmiCount} unit={QUOTA_UNITS.vmiCount} used={used} />
  );
};

export default QuotaVMICountCell;
