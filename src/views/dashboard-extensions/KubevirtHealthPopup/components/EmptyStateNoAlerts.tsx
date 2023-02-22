import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateIcon, Title, TitleSizes } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

type EmptyStateNoAlertsProps = {
  classname?: string;
};

const EmptyStateNoAlerts: FC<EmptyStateNoAlertsProps> = ({ classname }) => {
  return (
    <EmptyState className={classname}>
      <EmptyStateIcon icon={VirtualMachineIcon} />
      <Title headingLevel="h4" size={TitleSizes.md}>
        {t('No alerts found')}
      </Title>
    </EmptyState>
  );
};

export default EmptyStateNoAlerts;
