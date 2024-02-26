import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateHeader, EmptyStateIcon } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

type EmptyStateNoVMsProps = {
  className?: string;
};

const EmptyStateNoVMs: FC<EmptyStateNoVMsProps> = ({ className }) => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState className={className}>
      <EmptyStateHeader
        headingLevel="h4"
        icon={<EmptyStateIcon icon={VirtualMachineIcon} />}
        titleText={<>{t('No VirtualMachines found')}</>}
      />
    </EmptyState>
  );
};

export default EmptyStateNoVMs;
