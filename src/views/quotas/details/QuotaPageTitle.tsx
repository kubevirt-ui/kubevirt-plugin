import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ApplicationAwareClusterResourceQuotaModel } from '@kubevirt-utils/models';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { Breadcrumb, BreadcrumbItem, Title } from '@patternfly/react-core';

import QuotaActions from '../actions/QuotaActions';
import { CLUSTER_QUOTA_LIST_URL, getQuotaListURL } from '../utils/url';

type QuotaPageTitleProps = {
  name: string;
  namespace?: string;
  quota: ApplicationAwareQuota;
};

const QuotaPageTitle: FC<QuotaPageTitleProps> = ({ name, namespace, quota }) => {
  const { t } = useKubevirtTranslation();

  const isClusterScoped = quota?.kind === ApplicationAwareClusterResourceQuotaModel.kind;

  const listUrl = isClusterScoped ? CLUSTER_QUOTA_LIST_URL : getQuotaListURL(namespace);

  return (
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={listUrl}>{t('Quotas')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('Quota Details')}</BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <PaneHeading>
        <Title className="co-resource-item" headingLevel="h1">
          <span data-test-id="resource-title">{name ?? quota?.metadata?.name}</span>
        </Title>
        <QuotaActions quota={quota} />
      </PaneHeading>
    </DetailsPageTitle>
  );
};

export default QuotaPageTitle;
