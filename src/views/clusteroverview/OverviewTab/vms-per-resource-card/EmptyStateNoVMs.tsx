import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

type EmptyStateNoVMsProps = {
  className?: string;
};

const EmptyStateNoVMs: FC<EmptyStateNoVMsProps> = ({ className }) => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState
      className={className}
      headingLevel="h4"
      icon={VirtualMachineIcon}
      titleText={<>{t('No VirtualMachines found')}</>}
    />
  );
};

export default EmptyStateNoVMs;
