import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateIcon, Title, TitleSizes } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

type EmptyStateNoVMsProps = {
  className?: string;
  titleSize: TitleSizes;
};

const EmptyStateNoVMs: React.FC<EmptyStateNoVMsProps> = ({ className, titleSize }) => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState className={className}>
      <EmptyStateIcon icon={VirtualMachineIcon} />
      <Title headingLevel="h4" size={titleSize}>
        {t('No VirtualMachines found')}
      </Title>
    </EmptyState>
  );
};

export default EmptyStateNoVMs;
