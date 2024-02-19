import * as React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateVariant,
} from '@patternfly/react-core';

export const TemplatesCatalogEmptyState: React.FC<{
  bootSourcesLoaded: boolean;
  onClearFilters: () => void;
}> = React.memo(({ bootSourcesLoaded, onClearFilters }) => {
  const { t } = useKubevirtTranslation();

  if (!bootSourcesLoaded) {
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
  }

  return (
    <EmptyState variant={EmptyStateVariant.sm}>
      <EmptyStateHeader
        headingLevel="h4"
        titleText={<>{t('No Results Match the Filter Criteria')}</>}
      />
      <EmptyStateBody>
        {t('No Template items are being shown due to the filters being applied.')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button onClick={() => onClearFilters()} variant="link">
            {t('Clear all filters')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
});
TemplatesCatalogEmptyState.displayName = 'TemplatesCatalogEmptyState';
