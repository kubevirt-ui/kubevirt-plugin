import React, { FC } from 'react';
import { getQuotaModel } from 'src/views/quotas/utils/utils';

import DescriptionItemCreatedAt from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemCreatedAt';
import DescriptionItemName from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemName';
import DescriptionItemNamespace from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { Card, CardBody, CardTitle, DescriptionList } from '@patternfly/react-core';

type QuotaDetailsGridProps = {
  quota: ApplicationAwareQuota;
};

const QuotaDetailsGrid: FC<QuotaDetailsGridProps> = ({ quota }) => {
  const { t } = useKubevirtTranslation();

  const quotaModel = getQuotaModel(quota);

  return (
    <Card>
      <CardTitle>{t('Details')}</CardTitle>
      <CardBody>
        <DescriptionList>
          <DescriptionItemName model={quotaModel} resource={quota} />
          <DescriptionItemNamespace model={quotaModel} resource={quota} />
          <DescriptionItemCreatedAt model={quotaModel} resource={quota} />
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default QuotaDetailsGrid;
