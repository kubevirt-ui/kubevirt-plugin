import React, { FCC } from 'react';

import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';

import { QUOTA_UNITS } from '../../utils/constants';
import QuotaLimitBar from '../components/QuotaLimitBar/QuotaLimitBar';
import { getQuotaStatusData, getResourceKeysFromCallbacks, QuotaCallbacks } from '../utils/helpers';

type QuotaMemoryCellProps = {
  callbacks: QuotaCallbacks;
  row: ApplicationAwareQuota;
};

const QuotaMemoryCell: FCC<QuotaMemoryCellProps> = ({ callbacks, row }) => {
  const { memory } = getResourceKeysFromCallbacks(callbacks);
  const { hard, used } = getQuotaStatusData(row);

  return <QuotaLimitBar hard={hard} resourceKey={memory} unit={QUOTA_UNITS.memory} used={used} />;
};

export default QuotaMemoryCell;
