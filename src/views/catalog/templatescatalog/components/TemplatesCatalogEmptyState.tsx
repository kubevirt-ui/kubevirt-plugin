import * as React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';

export const TemplatesCatalogEmptyState: React.FC<{
  bootSourcesLoaded: boolean;
  onClearFilters: () => void;
}> = React.memo(({ onClearFilters, bootSourcesLoaded }) => {
  const { t } = useKubevirtTranslation();

  if (!bootSourcesLoaded) {
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
  }

  return (
    <EmptyState variant={EmptyStateVariant.small}>
      <Title headingLevel="h4" size="lg">
        {t('No Results Match the Filter Criteria')}
      </Title>
      <EmptyStateBody>
        {t('No Template items are being shown due to the filters being applied.')}
      </EmptyStateBody>
      <EmptyStateSecondaryActions>
        <Button variant="link" onClick={() => onClearFilters()}>
          {t('Clear All Filters')}
        </Button>
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
});
TemplatesCatalogEmptyState.displayName = 'TemplatesCatalogEmptyState';
