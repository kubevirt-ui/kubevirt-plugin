import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateBody, EmptyStateVariant } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

const MigrationEmptyState: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState
      headingLevel="h5"
      icon={SearchIcon}
      titleText={<>{t('No results found')}</>}
      variant={EmptyStateVariant.full}
    >
      <EmptyStateBody>
        {t('Migrate a VirtualMachine to a different Node or change the selected time range.')}
      </EmptyStateBody>
    </EmptyState>
  );
};
export default MigrationEmptyState;
