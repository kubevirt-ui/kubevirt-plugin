import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { PendingChangesAlert } from '../PendingChangesAlert/PendingChangesAlert';

const ModalPendingChangesAlert: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <PendingChangesAlert isWarning title={t('Restart the VirtualMachine to apply changes.')} />
  );
};

export default ModalPendingChangesAlert;
