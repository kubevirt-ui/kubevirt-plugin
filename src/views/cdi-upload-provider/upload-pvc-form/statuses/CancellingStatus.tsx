import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';

const CancellingStatus: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState headingLevel="h4" icon={Spinner} titleText={t('Cancelling upload')}>
      <EmptyStateBody> {t('Resources are being removed, please wait.')}</EmptyStateBody>
    </EmptyState>
  );
};

export default CancellingStatus;
