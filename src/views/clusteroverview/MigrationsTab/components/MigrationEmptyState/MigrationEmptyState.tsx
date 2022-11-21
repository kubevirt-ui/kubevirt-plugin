import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

const MigrationEmptyState: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.full}>
      <EmptyStateIcon icon={SearchIcon} />
      <Title headingLevel="h5" size="lg">
        {t('No results found')}
      </Title>
      <EmptyStateBody>
        {t('Migrate a VirtualMachine to a different Node or change the selected time range.')}
      </EmptyStateBody>
    </EmptyState>
  );
};
export default MigrationEmptyState;
