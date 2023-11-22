import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyStateBody, EmptyStateIcon, Spinner, Title } from '@patternfly/react-core';

const CancellingStatus: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <EmptyStateIcon icon={Spinner} />
      <Title headingLevel="h4" size="lg">
        {t('Cancelling upload')}
      </Title>
      <EmptyStateBody> {t('Resources are being removed, please wait.')}</EmptyStateBody>
    </>
  );
};

export default CancellingStatus;
