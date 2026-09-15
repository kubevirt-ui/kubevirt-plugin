import { type TFunction } from 'i18next';

import { type ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getAdditionalResourceKeys, getResourceLabel, getStatus } from './utils';

export const getAdditionalQuotaDisplayValue = (
  quota: ApplicationAwareQuota,
  t: TFunction,
): string => {
  const additionalResourceKeys = getAdditionalResourceKeys(quota);
  if (isEmpty(additionalResourceKeys)) {
    return NO_DATA_DASH;
  }

  const quotaStatus = getStatus(quota);
  const hard = quotaStatus?.hard;
  const used = quotaStatus?.used;

  return additionalResourceKeys
    .map((resourceKey) =>
      t('{{label}}: {{used}} / {{hard}}', {
        hard: hard?.[resourceKey] ?? NO_DATA_DASH,
        label: getResourceLabel(resourceKey, t),
        used: used?.[resourceKey] ?? NO_DATA_DASH,
      }),
    )
    .join(', ');
};
