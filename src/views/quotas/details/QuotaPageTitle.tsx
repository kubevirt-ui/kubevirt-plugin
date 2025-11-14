import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ApplicationAwareClusterResourceQuotaModel } from '@kubevirt-utils/models';
import { Breadcrumb, BreadcrumbItem, Title } from '@patternfly/react-core';

import QuotaActions from '../actions/QuotaActions';
import { ApplicationAwareQuota } from '../form/types';

type QuotaPageTitleProps = {
  name: string;
  namespace?: string;
  quota: ApplicationAwareQuota;
};

const QuotaPageTitle: React.FC<QuotaPageTitleProps> = ({ name, namespace, quota }) => {
  const { t } = useKubevirtTranslation();

  const isClusterScoped = quota?.kind === ApplicationAwareClusterResourceQuotaModel.kind;

  const listUrl = isClusterScoped
    ? `/k8s/all-namespaces/quotas`
    : `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/quotas`;

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
