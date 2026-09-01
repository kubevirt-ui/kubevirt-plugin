import React, { type FC } from 'react';

import BackgroundOperationAlert from '@kubevirt-utils/components/TabModal/BackgroundOperationAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

type CloneStatusAlertsProps = {
  cloneFailureMessage: string | undefined;
  isCloneFailed: boolean;
  isCloneInProgress: boolean;
};

const CloneStatusAlerts: FC<CloneStatusAlertsProps> = ({
  cloneFailureMessage,
  isCloneFailed,
  isCloneInProgress,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <BackgroundOperationAlert
        description={t(
          'Cloning may take several minutes. You can close this dialog — the process will continue in the background. The cloned virtual machine may take some time to appear in the list.',
        )}
        isVisible={isCloneInProgress}
      />
      {isCloneFailed && (
        <Alert isInline title={t('Clone failed')} variant={AlertVariant.danger}>
          {cloneFailureMessage ??
            t(
              'The operation could not be completed. Please try again or contact your administrator.',
            )}
        </Alert>
      )}
    </>
  );
};

export default CloneStatusAlerts;
