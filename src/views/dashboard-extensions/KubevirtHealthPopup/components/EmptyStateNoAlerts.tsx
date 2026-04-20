import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

type EmptyStateNoAlertsProps = {
  classname?: string;
};

const EmptyStateNoAlerts: FCC<EmptyStateNoAlertsProps> = ({ classname }) => {
  const { t } = useKubevirtTranslation();
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
