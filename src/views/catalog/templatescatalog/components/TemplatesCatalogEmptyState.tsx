import * as React from 'react';

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
  onClearFilters: () => void;
}> = React.memo(({ onClearFilters }) => {
  const { t } = useKubevirtTranslation();

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
