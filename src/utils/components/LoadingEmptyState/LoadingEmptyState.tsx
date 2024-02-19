import React, { ComponentType, FC, ReactNode } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';

type LoadingEmptyStateProps = {
  bodyContents?: ReactNode | string;
  iconComponent?: ComponentType;
};

const LoadingEmptyState: FC<LoadingEmptyStateProps> = ({
  bodyContents = t('Loading ...'),
  iconComponent = Spinner,
}) => {
  return (
    <EmptyState>
      <EmptyStateHeader icon={<EmptyStateIcon icon={iconComponent} />} />
      <EmptyStateBody>{bodyContents}</EmptyStateBody>
    </EmptyState>
  );
};

export default LoadingEmptyState;
