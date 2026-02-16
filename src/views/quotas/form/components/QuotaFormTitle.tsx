import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { Breadcrumb, BreadcrumbItem, Button, Stack, Title } from '@patternfly/react-core';

import QuotasLearnMoreLink from '../../list/components/QuotasLearnMoreLink';
import { getQuotaListURL } from '../../utils/url';

type QuotaFormTitleProps = {
  isEdit?: boolean;
};

const QuotaFormTitle: FC<QuotaFormTitleProps> = ({ isEdit = false }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const namespace = useNamespaceParam();

  return (
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Button isInline onClick={() => navigate(getQuotaListURL(namespace))} variant="link">
              {t('Quotas')}
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem>{isEdit ? t('Edit quota') : t('Create quota')}</BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <Stack>
        <Title headingLevel="h1">
          {isEdit ? t('Edit application-aware quota') : t('Create application-aware quota')}
        </Title>
        <div className="pf-v6-u-text-color-subtle pf-v6-u-mt-md pf-v6-u-mb-sm">
          {t(
            'Manage resource limits for virtualized workloads with Application-Aware Quota (AAQ) to provide the flexibility needed for seamless VM migrations and infrastructure maintenance.',
          )}
        </div>
        <QuotasLearnMoreLink />
      </Stack>
    </DetailsPageTitle>
  );
};

export default QuotaFormTitle;
