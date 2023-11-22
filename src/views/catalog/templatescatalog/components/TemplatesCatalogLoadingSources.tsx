import * as React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateBody, EmptyStateVariant, Title } from '@patternfly/react-core';

export const TemplatesCatalogLoadingSources = React.memo(() => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState variant={EmptyStateVariant.large}>
      <Title headingLevel="h4" size="lg">
        {t('Loading Templates with available boot source')}
      </Title>
      <EmptyStateBody>
        <Loading />
      </EmptyStateBody>
    </EmptyState>
  );
});

TemplatesCatalogLoadingSources.displayName = 'TemplatesCatalogLoadingSources';
