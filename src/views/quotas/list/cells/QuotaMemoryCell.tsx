import type { FC } from 'react';

import type { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';

import { QUOTA_UNITS } from '../../utils/constants';
import QuotaLimitBar from '../components/QuotaLimitBar/QuotaLimitBar';
import type { QuotaCallbacks } from '../utils/helpers';
import { getQuotaStatusData, getResourceKeysFromCallbacks } from '../utils/helpers';

type QuotaMemoryCellProps = {
  callbacks: QuotaCallbacks;
  row: ApplicationAwareQuota;
};

const QuotaMemoryCell: FC<QuotaMemoryCellProps> = ({ callbacks, row }) => {
  const { memory } = getResourceKeysFromCallbacks(callbacks);
  const { hard, used } = getQuotaStatusData(row);

  return <QuotaLimitBar hard={hard} resourceKey={memory} unit={QUOTA_UNITS.memory} used={used} />;
};

export default QuotaMemoryCell;
