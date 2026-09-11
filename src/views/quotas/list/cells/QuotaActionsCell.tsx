import type { FC } from 'react';

import type { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';

import QuotaActions from '../../actions/QuotaActions';

type QuotaActionsCellProps = {
  row: ApplicationAwareQuota;
};

const QuotaActionsCell: FC<QuotaActionsCellProps> = ({ row }) => (
  <QuotaActions isKebabToggle quota={row} />
);

export default QuotaActionsCell;
