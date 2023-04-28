import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

import './VirtualMachineConsolePageTitle.scss';

const VirtualMachineConsolePageTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Title headingLevel="h2" className="virtual-machine-console-page-title">
      {t('Console')}
    </Title>
  );
};

export default VirtualMachineConsolePageTitle;
