import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Button, Stack, Title } from '@patternfly/react-core';

import QuotasLearnMoreLink from '../../list/components/QuotasLearnMoreLink';

const QuotaCreateFormTitle: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  return (
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Button isInline onClick={() => navigate(`/k8s/all-namespaces/quotas`)} variant="link">
              {t('Quotas')}
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('Create quota')}</BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <Stack>
        <Title headingLevel="h1">{t('Create virtualization quota')}</Title>
        <div className="pf-v6-u-text-color-subtle pf-v6-u-mt-md pf-v6-u-mb-sm">
          {t(
            'Define virtualization-specific resource limits and thresholds managed by the Application Aware Quota (AAQ) Operator.',
          )}
        </div>
        <QuotasLearnMoreLink />
      </Stack>
    </DetailsPageTitle>
  );
};

export default QuotaCreateFormTitle;
