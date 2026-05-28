import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

type BackgroundOperationAlertProps = {
  description?: string;
  isVisible: boolean;
};

const BackgroundOperationAlert: FC<BackgroundOperationAlertProps> = ({
  description,
  isVisible,
}) => {
  const { t } = useKubevirtTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <Alert
      title={
        description || t('You can close this dialog — the process will continue in the background.')
      }
      isInline
      variant={AlertVariant.info}
    />
  );
};

export default BackgroundOperationAlert;
