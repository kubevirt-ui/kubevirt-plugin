import React, { FCC } from 'react';
import { Link } from 'react-router';

import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { getName } from '@kubevirt-utils/resources/shared';

import { getQuotaDetailsURL } from '../../utils/url';

type QuotaNameCellProps = {
  row: ApplicationAwareQuota;
};

const QuotaNameCell: FCC<QuotaNameCellProps> = ({ row }) => {
  const quotaDetailsPath = getQuotaDetailsURL(row);
  return <Link to={quotaDetailsPath}>{getName(row)}</Link>;
};

export default QuotaNameCell;
