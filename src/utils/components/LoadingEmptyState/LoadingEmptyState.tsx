import React, { ComponentType, ReactNode } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateBody, EmptyStateIcon, Spinner } from '@patternfly/react-core';

type LoadingEmptyStateProps = {
  bodyContents?: string | ReactNode;
  iconVariant?: 'container' | 'icon';
  iconComponent?: ComponentType;
};

const LoadingEmptyState: React.FC<LoadingEmptyStateProps> = ({
  bodyContents = t('Loading ...'),
  iconVariant = 'container',
  iconComponent = Spinner,
}) => {
  return (
    <EmptyState>
      <EmptyStateIcon variant={iconVariant} component={iconComponent} />
      <EmptyStateBody>{bodyContents}</EmptyStateBody>
    </EmptyState>
  );
};

export default LoadingEmptyState;
