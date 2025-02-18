import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

type EmptyStateNoAlertsProps = {
  classname?: string;
};

const EmptyStateNoAlerts: FC<EmptyStateNoAlertsProps> = ({ classname }) => {
  return (
    <EmptyState
      className={classname}
      headingLevel="h4"
      icon={VirtualMachineIcon}
      titleText={<>{t('No alerts found')}</>}
    />
  );
};

export default EmptyStateNoAlerts;
