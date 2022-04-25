import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { PendingChangesAlert } from '../PendingChangesAlert/PendingChangesAlert';

type ModalPendingChangesAlertProps = {
  isChanged: boolean;
};

export const ModalPendingChangesAlert: React.FC<ModalPendingChangesAlertProps> = ({
  isChanged,
}) => {
  const { t } = useKubevirtTranslation();
  const modalMsg = isChanged
    ? t('The changes you have made require this VirtualMachine to be restarted.')
    : t(
        'Changes to the following settings will need to restart the VirtualMachine in order for them to be applied',
      );
  return (
    <PendingChangesAlert
      warningMsg={modalMsg}
      isWarning={isChanged}
      title={t('Restart required to apply changes')}
    />
  );
};
