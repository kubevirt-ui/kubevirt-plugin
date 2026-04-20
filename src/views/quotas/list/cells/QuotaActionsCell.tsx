import React, { FCC } from 'react';

import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';

import QuotaActions from '../../actions/QuotaActions';

type QuotaActionsCellProps = {
  row: ApplicationAwareQuota;
};

const QuotaActionsCell: FCC<QuotaActionsCellProps> = ({ row }) => (
  <QuotaActions isKebabToggle quota={row} />
);

export default QuotaActionsCell;
