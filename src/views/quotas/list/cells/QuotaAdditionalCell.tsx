import React, { FC } from 'react';

import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';

import { getAdditionalResourceKeys, getStatus } from '../../utils/utils';
import AdditionalQuotaPopover from '../components/AdditionalQuotaPopover/AdditionalQuotaPopover';

type QuotaAdditionalCellProps = {
  row: ApplicationAwareQuota;
};

const QuotaAdditionalCell: FC<QuotaAdditionalCellProps> = ({ row }) => {
  const quotaStatus = getStatus(row);
  const additionalResourceKeys = getAdditionalResourceKeys(row);

  return (
    <AdditionalQuotaPopover
      additionalResourceKeys={additionalResourceKeys}
      quotaStatus={quotaStatus}
    />
  );
};

export default QuotaAdditionalCell;
