import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateIcon, Title, TitleSizes } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

type EmptyStateNoVMsProps = {
  titleSize: TitleSizes;
  className?: string;
};

const EmptyStateNoVMs: React.FC<EmptyStateNoVMsProps> = ({ titleSize, className }) => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState className={className}>
      <EmptyStateIcon icon={VirtualMachineIcon} />
      <Title headingLevel="h4" size={titleSize}>
        {t('No virtual machines found')}
      </Title>
    </EmptyState>
  );
};

export default EmptyStateNoVMs;
