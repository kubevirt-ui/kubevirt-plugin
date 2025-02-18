import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { ErrorCircleOIcon } from '@patternfly/react-icons';

type ErrorStatusProps = {
  error: any;
  onErrorClick: () => void;
};

const ErrorStatus: React.FC<ErrorStatusProps> = ({ error, onErrorClick }) => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState
      headingLevel="h4"
      icon={ErrorCircleOIcon}
      status="danger"
      titleText={t('Error uploading data')}
    >
      <EmptyStateBody>{error}</EmptyStateBody>
      <Button id="cdi-upload-error-btn" onClick={onErrorClick} variant="primary">
        {error ? t('Back to form') : t('View PersistentVolumeClaim details')}
      </Button>
    </EmptyState>
  );
};

export default ErrorStatus;
