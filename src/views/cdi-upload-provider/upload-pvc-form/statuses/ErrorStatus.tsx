import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import { ErrorCircleOIcon } from '@patternfly/react-icons';

type ErrorStatusProps = {
  error: any;
  onErrorClick: () => void;
};

const ErrorStatus: React.FC<ErrorStatusProps> = ({ error, onErrorClick }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <EmptyStateIcon icon={ErrorCircleOIcon} color="#cf1010" />
      <Title headingLevel="h4" size="lg">
        {t('Error uploading data')}
      </Title>
      <EmptyStateBody>{error}</EmptyStateBody>
      <Button id="cdi-upload-error-btn" variant="primary" onClick={onErrorClick}>
        {error ? t('Back to form') : t('View PersistentVolumeClaim details')}
      </Button>
    </>
  );
};

export default ErrorStatus;
