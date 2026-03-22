import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { getName } from '@kubevirt-utils/resources/shared';

import { getQuotaDetailsURL } from '../../utils/url';

type QuotaNameCellProps = {
  row: ApplicationAwareQuota;
};

const QuotaNameCell: FC<QuotaNameCellProps> = ({ row }) => {
  const quotaDetailsPath = getQuotaDetailsURL(row);
  return <Link to={quotaDetailsPath}>{getName(row)}</Link>;
};

export default QuotaNameCell;
