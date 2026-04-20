import React, { FCC } from 'react';

import { ApplicationAwareQuota, CalculationMethod } from '@kubevirt-utils/resources/quotas/types';

import QuotaLimitBar from '../components/QuotaLimitBar/QuotaLimitBar';
import { getQuotaStatusData, getResourceKeysFromCallbacks, QuotaCallbacks } from '../utils/helpers';

type QuotaCPUCellProps = {
  callbacks: QuotaCallbacks;
  row: ApplicationAwareQuota;
};

const QuotaCPUCell: FCC<QuotaCPUCellProps> = ({ callbacks, row }) => {
  const { cpu } = getResourceKeysFromCallbacks(callbacks);
  const { hard, used } = getQuotaStatusData(row);
  const unit = callbacks.calculationMethod === CalculationMethod.VmiPodUsage ? 'CPU' : 'vCPU';

  return <QuotaLimitBar hard={hard} resourceKey={cpu} unit={unit} used={used} />;
};

export default QuotaCPUCell;
