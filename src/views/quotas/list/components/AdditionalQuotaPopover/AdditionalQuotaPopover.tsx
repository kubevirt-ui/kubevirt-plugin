import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { QuotaStatus } from '@kubevirt-utils/resources/quotas/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, DescriptionList, Popover } from '@patternfly/react-core';

import { getResourceLabel } from '../../../utils/utils';

import './AdditionalQuotaPopover.scss';

type AdditionalQuotaPopoverProps = {
  additionalResourceKeys: string[];
  quotaStatus: QuotaStatus;
};

const AdditionalQuotaPopover: FC<AdditionalQuotaPopoverProps> = ({
  additionalResourceKeys,
  quotaStatus,
}) => {
  const { t } = useKubevirtTranslation();

  if (isEmpty(additionalResourceKeys)) {
    return <span>{NO_DATA_DASH}</span>;
  }

  const { hard, used } = quotaStatus;

  const additionalResourceInfo = additionalResourceKeys.map((resourceKey) => {
    const hardValue = hard[resourceKey];
    const usedValue = used[resourceKey];
    return {
      key: resourceKey,
      label: getResourceLabel(resourceKey, t),
      value: `${usedValue} / ${hardValue}`,
    };
  });

  return (
    <Popover
      bodyContent={() => (
        <DescriptionList className="additional-quota-popover__description-list" isFluid>
          {additionalResourceInfo.map((resource) => (
            <DescriptionItem
              descriptionData={resource.value}
              descriptionHeader={resource.label}
              key={resource.key}
            />
          ))}
        </DescriptionList>
      )}
      headerContent={t('Additional quota limits')}
    >
      <Button isInline variant="link">
        {t('Other ({{count}})', { count: additionalResourceKeys.length })}
      </Button>
    </Popover>
  );
};

export default AdditionalQuotaPopover;
