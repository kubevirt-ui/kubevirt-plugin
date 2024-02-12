import * as React from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateSecondaryActions,
  Title,
} from '@patternfly/react-core';

export const WizardEmptyState: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  return (
    <EmptyState>
      <Title headingLevel="h4" size="lg">
        {t('No Template found')}
      </Title>
      <EmptyStateBody>
        {t('No Template was selected for review, please go to the catalog and select one.')}
      </EmptyStateBody>
      <EmptyStateSecondaryActions>
        <Button onClick={() => navigate(`/k8s/ns/${namespace}/catalog/template`)}>
          {t('Go to catalog')}
        </Button>
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};
