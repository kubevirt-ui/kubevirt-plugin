import * as React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateBody, EmptyStateVariant } from '@patternfly/react-core';

export const TemplatesCatalogLoadingSources = React.memo(() => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState
      headingLevel="h4"
      titleText={<>{t('Loading Templates with available boot source')}</>}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        <Loading />
      </EmptyStateBody>
    </EmptyState>
  );
});

TemplatesCatalogLoadingSources.displayName = 'TemplatesCatalogLoadingSources';
