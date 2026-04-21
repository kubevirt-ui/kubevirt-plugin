import React, { FC } from 'react';

import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type PendingChangesProps = {
  isVMRunning?: boolean;
};

const PendingChanges: FC<PendingChangesProps> = ({ isVMRunning }) => {
  const { t } = useKubevirtTranslation();

  if (!isVMRunning) return null;

  return (
    <PendingChangesAlert title={t(' Adding hot plugged disk')}>
      {t('Additional disks types and interfaces are available when the VirtualMachine is stopped.')}
    </PendingChangesAlert>
  );
};

export default PendingChanges;
