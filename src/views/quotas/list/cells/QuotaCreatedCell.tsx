import type { FC } from 'react';
import React from 'react';

import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import type { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { getCreationTimestamp } from '@kubevirt-utils/resources/shared';

type QuotaCreatedCellProps = {
  row: ApplicationAwareQuota;
};

const QuotaCreatedCell: FC<QuotaCreatedCellProps> = ({ row }) => (
  <Timestamp timestamp={getCreationTimestamp(row)} />
);

export default QuotaCreatedCell;
