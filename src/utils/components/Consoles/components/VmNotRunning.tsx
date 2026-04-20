import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateBody } from '@patternfly/react-core';

const VmNotRunning: FCC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState>
      <EmptyStateBody>
        {t('This VirtualMachine is down. Please start it to access its console.')}
      </EmptyStateBody>
    </EmptyState>
  );
};

export default VmNotRunning;
