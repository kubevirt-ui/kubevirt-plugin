import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

const MigrationEmptyState: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.full}>
      <EmptyStateHeader
        headingLevel="h5"
        icon={<EmptyStateIcon icon={SearchIcon} />}
        titleText={<>{t('No results found')}</>}
      />
      <EmptyStateBody>
        {t('Migrate a VirtualMachine to a different Node or change the selected time range.')}
      </EmptyStateBody>
    </EmptyState>
  );
};
export default MigrationEmptyState;
