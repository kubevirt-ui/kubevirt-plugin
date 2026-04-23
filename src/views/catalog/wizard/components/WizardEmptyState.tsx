import React, { FC } from 'react';
import { useNavigate } from 'react-router';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getCatalogURL } from '@multicluster/urls';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';

export const WizardEmptyState: FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const cluster = useClusterParam();

  return (
    <EmptyState headingLevel="h4" titleText={<>{t('No Template found')}</>}>
      <EmptyStateBody>
        {t('No Template was selected for review, please go to the catalog and select one.')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button onClick={() => navigate(`${getCatalogURL(cluster, namespace)}/template`)}>
            {t('Go to catalog')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
