import * as React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
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
  processedTemplateAccessReview: boolean;
  namespace: string;
}> = React.memo(
  ({ onClearFilters, bootSourcesLoaded, processedTemplateAccessReview, namespace }) => {
    const { t } = useKubevirtTranslation();

    if (!processedTemplateAccessReview) {
      return (
        <Alert variant="danger" title={t('Error')} isInline>
          {!namespace
            ? t(
                'Create VirtualMachine is forbidden at cluster scope for this user. Please select a Project',
              )
            : t(
                'Create VirtualMachine is forbidden at "{{namespace}}" Project for this user. Please select a different Project',
                { namespace },
              )}
        </Alert>
      );
    }

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
  },
);
TemplatesCatalogEmptyState.displayName = 'TemplatesCatalogEmptyState';
