import * as React from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
} from '@patternfly/react-core';

export const WizardEmptyState: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  return (
    <EmptyState>
      <EmptyStateHeader headingLevel="h4" titleText={<>{t('No Template found')}</>} />
      <EmptyStateBody>
        {t('No Template was selected for review, please go to the catalog and select one.')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button onClick={() => navigate(`/k8s/ns/${namespace}/catalog/template`)}>
            {t('Go to catalog')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
