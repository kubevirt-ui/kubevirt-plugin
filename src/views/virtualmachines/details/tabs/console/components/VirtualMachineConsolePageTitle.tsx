import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

import './VirtualMachineConsolePageTitle.scss';

const VirtualMachineConsolePageTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Title className="virtual-machine-console-page-title" headingLevel="h2">
      {t('Console')}
    </Title>
  );
};

export default VirtualMachineConsolePageTitle;
