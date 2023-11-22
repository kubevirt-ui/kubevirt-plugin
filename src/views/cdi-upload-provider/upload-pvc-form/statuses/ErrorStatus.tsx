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
      <EmptyStateIcon color="#cf1010" icon={ErrorCircleOIcon} />
      <Title headingLevel="h4" size="lg">
        {t('Error uploading data')}
      </Title>
      <EmptyStateBody>{error}</EmptyStateBody>
      <Button id="cdi-upload-error-btn" onClick={onErrorClick} variant="primary">
        {error ? t('Back to form') : t('View PersistentVolumeClaim details')}
      </Button>
    </>
  );
};

export default ErrorStatus;
