import * as React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateVariant,
} from '@patternfly/react-core';

export const TemplatesCatalogLoadingSources = React.memo(() => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        headingLevel="h4"
        titleText={<>{t('Loading Templates with available boot source')}</>}
      />
      <EmptyStateBody>
        <Loading />
      </EmptyStateBody>
    </EmptyState>
  );
});

TemplatesCatalogLoadingSources.displayName = 'TemplatesCatalogLoadingSources';
