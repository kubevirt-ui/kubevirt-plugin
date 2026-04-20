import React, { ComponentType, FCC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';

type LoadingEmptyStateProps = {
  bodyContents?: ReactNode | string;
  iconComponent?: ComponentType;
};

const LoadingEmptyState: FCC<LoadingEmptyStateProps> = ({
  bodyContents,
  iconComponent = Spinner,
}) => {
  const { t } = useKubevirtTranslation();
  const defaultBodyContents = bodyContents ?? t('Loading ...');

  return (
    <EmptyState icon={iconComponent}>
      <EmptyStateBody>{defaultBodyContents}</EmptyStateBody>
    </EmptyState>
  );
};

export default LoadingEmptyState;
