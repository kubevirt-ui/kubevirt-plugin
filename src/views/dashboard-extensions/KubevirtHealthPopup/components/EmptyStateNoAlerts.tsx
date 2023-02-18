import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateIcon, Title, TitleSizes } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

const EmptyStateNoAlerts: FC = () => {
  return (
    <EmptyState>
      <EmptyStateIcon icon={VirtualMachineIcon} />
      <Title headingLevel="h4" size={TitleSizes.md}>
        {t('No alerts found')}
      </Title>
    </EmptyState>
  );
};

export default EmptyStateNoAlerts;
