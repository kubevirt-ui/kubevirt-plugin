import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

import './PendingChangesAlert.scss';

type PendingChangesAlertProps = {
  isWarning?: boolean;
  title?: string;
  warningMsg?: string;
};

export const PendingChangesAlert: React.FC<PendingChangesAlertProps> = ({
  children,
  isWarning,
  title,
  warningMsg,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Alert
      className="pending-changes-alert"
      isInline
      title={title || t('Pending Changes')}
      variant={isWarning ? AlertVariant.warning : AlertVariant.info}
    >
      {warningMsg || children}
    </Alert>
  );
};
