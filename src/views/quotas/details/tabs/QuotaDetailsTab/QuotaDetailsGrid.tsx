import React from 'react';
import { ApplicationAwareQuota } from 'src/views/quotas/form/types';
import { getQuotaModel, isNamespacedQuota } from 'src/views/quotas/utils/utils';

import DescriptionItemCreatedAt from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemCreatedAt';
import DescriptionItemName from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemName';
import DescriptionItemNamespace from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemNamespace';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack } from '@patternfly/react-core';

type QuotaDetailsGridProps = {
  quota: ApplicationAwareQuota;
};

const QuotaDetailsGrid: React.FC<QuotaDetailsGridProps> = ({ quota }) => {
  const { t } = useKubevirtTranslation();
  const quotaModel = getQuotaModel(quota);

  const isNamespaced = isNamespacedQuota(quota);

  return (
    <Stack>
      <DescriptionItemName model={quotaModel} resource={quota} />
      <DescriptionItem
        descriptionData={isNamespaced ? t('Project-scoped') : t('Cluster-scoped')}
        descriptionHeader={t('Scope')}
      />
      {isNamespacedQuota(quota) && <DescriptionItemNamespace model={quotaModel} resource={quota} />}
      <DescriptionItemCreatedAt model={quotaModel} resource={quota} />
    </Stack>
  );
};

export default QuotaDetailsGrid;
