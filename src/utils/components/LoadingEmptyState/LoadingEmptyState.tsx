import React, { ComponentType, ReactNode } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateBody, EmptyStateIcon, Spinner } from '@patternfly/react-core';

type LoadingEmptyStateProps = {
  bodyContents?: ReactNode | string;
  iconComponent?: ComponentType;
  iconVariant?: 'container' | 'icon';
};

const LoadingEmptyState: React.FC<LoadingEmptyStateProps> = ({
  bodyContents = t('Loading ...'),
  iconComponent = Spinner,
  iconVariant = 'container',
}) => {
  return (
    <EmptyState>
      <EmptyStateIcon component={iconComponent} variant={iconVariant} />
      <EmptyStateBody>{bodyContents}</EmptyStateBody>
    </EmptyState>
  );
};

export default LoadingEmptyState;
