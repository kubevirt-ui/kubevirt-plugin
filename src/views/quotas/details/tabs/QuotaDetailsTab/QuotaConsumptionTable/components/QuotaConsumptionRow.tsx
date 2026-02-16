import React, { FC } from 'react';
import { getCountText } from 'src/views/quotas/details/utils';
import {
  getQuotaNumbers,
  getResourceKeyKind,
  getResourceLabel,
} from 'src/views/quotas/utils/utils';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { QuotaStatus } from '@kubevirt-utils/resources/quotas/types';
import { Td, Tr } from '@patternfly/react-table';

import { QuotaCapacityIcon } from './QuotaCapacityIcon';

type QuotaConsumptionRowProps = {
  quotaStatus: QuotaStatus;
  resourceKey: string;
};

const QuotaConsumptionRow: FC<QuotaConsumptionRowProps> = ({ quotaStatus, resourceKey }) => {
  const { t } = useKubevirtTranslation();

  const { max, percentage, used } = getQuotaNumbers(
    quotaStatus.used[resourceKey],
    quotaStatus.hard[resourceKey],
  );
  const resourceLabel = getResourceLabel(resourceKey, t);
  const resourceKeyKind = getResourceKeyKind(resourceKey);

  const usedText = getCountText(used, resourceKeyKind, resourceLabel);
  const maxText = getCountText(max, resourceKeyKind, resourceLabel);

  return (
    <Tr>
      <Td modifier="breakWord">{resourceLabel}</Td>
      <Td className="co-resource-quota-icon" visibility={['hidden', 'visibleOnMd']}>
        <QuotaCapacityIcon percent={percentage} />
      </Td>
      <Td>{usedText}</Td>
      <Td>{maxText}</Td>
    </Tr>
  );
};

export default QuotaConsumptionRow;
