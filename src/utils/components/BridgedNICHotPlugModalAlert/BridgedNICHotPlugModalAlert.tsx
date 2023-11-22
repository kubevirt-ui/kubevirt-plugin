import React, { FC } from 'react';

import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const BridgedNICHotPlugModalAlert: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <PendingChangesAlert
      isWarning
      title={t('Live migrate or restart the VirtualMachine to apply changes.')}
    />
  );
};

export default BridgedNICHotPlugModalAlert;
