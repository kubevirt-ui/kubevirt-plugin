import React, { FCC } from 'react';

import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { getCreationTimestamp } from '@kubevirt-utils/resources/shared';

type QuotaCreatedCellProps = {
  row: ApplicationAwareQuota;
};

const QuotaCreatedCell: FCC<QuotaCreatedCellProps> = ({ row }) => (
  <Timestamp timestamp={getCreationTimestamp(row)} />
);

export default QuotaCreatedCell;
