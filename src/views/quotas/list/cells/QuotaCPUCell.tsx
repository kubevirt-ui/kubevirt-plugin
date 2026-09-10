import type { FC } from 'react';
import React from 'react';

import type { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { CalculationMethod } from '@kubevirt-utils/resources/quotas/types';

import QuotaLimitBar from '../components/QuotaLimitBar/QuotaLimitBar';
import type { QuotaCallbacks } from '../utils/helpers';
import { getQuotaStatusData, getResourceKeysFromCallbacks } from '../utils/helpers';

type QuotaCPUCellProps = {
  callbacks: QuotaCallbacks;
  row: ApplicationAwareQuota;
};

const QuotaCPUCell: FC<QuotaCPUCellProps> = ({ callbacks, row }) => {
  const { cpu } = getResourceKeysFromCallbacks(callbacks);
  const { hard, used } = getQuotaStatusData(row);
  const unit = callbacks.calculationMethod === CalculationMethod.VmiPodUsage ? 'CPU' : 'vCPU';

  return <QuotaLimitBar hard={hard} resourceKey={cpu} unit={unit} used={used} />;
};

export default QuotaCPUCell;
