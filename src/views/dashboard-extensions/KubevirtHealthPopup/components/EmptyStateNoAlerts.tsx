import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateHeader, EmptyStateIcon } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

type EmptyStateNoAlertsProps = {
  classname?: string;
};

const EmptyStateNoAlerts: FC<EmptyStateNoAlertsProps> = ({ classname }) => {
  return (
    <EmptyState className={classname}>
      <EmptyStateHeader
        headingLevel="h4"
        icon={<EmptyStateIcon icon={VirtualMachineIcon} />}
        titleText={<>{t('No alerts found')}</>}
      />
    </EmptyState>
  );
};

export default EmptyStateNoAlerts;
