import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

import './PendingChangesAlert.scss';

type PendingChangesAlertProps = {
  warningMsg?: string;
  isWarning?: boolean;
  title?: string;
};

export const PendingChangesAlert: React.FC<PendingChangesAlertProps> = ({
  warningMsg,
  isWarning,
  title,
  children,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Alert
      className="pending-changes-alert"
      title={title || t('Pending Changes')}
      isInline
      variant={isWarning ? AlertVariant.warning : AlertVariant.info}
    >
      {warningMsg || children}
    </Alert>
  );
};
