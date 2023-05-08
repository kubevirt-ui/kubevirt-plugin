import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  Title,
} from '@patternfly/react-core';
import { TopologyIcon } from '@patternfly/react-icons';

type LimitExceededStateProps = {
  onShowTopologyAnyway: () => void;
};

export const LimitExceededState: React.FC<LimitExceededStateProps> = ({ onShowTopologyAnyway }) => {
  const { t } = useTranslation();
  return (
    <EmptyState>
      <EmptyStateIcon variant="container" component={TopologyIcon} />
      <Title headingLevel="h4" size="lg">
        {t(`kubevirt-plugin~Loading is taking longer than expected`)}
      </Title>
      <EmptyStateBody>
        {t(
          `kubevirt-plugin~We noticed that it is taking a long time to visualize your application Topology. You can use Search to find specific resources or click Continue to keep waiting.`,
        )}
      </EmptyStateBody>
      <Button variant="primary" component={(props) => <Link {...props} to="/search-page" />}>
        {t('kubevirt-plugin~Go to Search')}
      </Button>
      <EmptyStateSecondaryActions>
        <Button variant="link" onClick={onShowTopologyAnyway}>
          {t('kubevirt-plugin~Continue')}
        </Button>
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};
