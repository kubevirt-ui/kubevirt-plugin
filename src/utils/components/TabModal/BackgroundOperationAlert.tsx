import { type FC } from 'react';

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
      isInline
      title={
        description ?? t('You can close this dialog — the process will continue in the background.')
      }
      variant={AlertVariant.info}
    />
  );
};

export default BackgroundOperationAlert;
