import React, { FC } from 'react';

import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { StackItem } from '@patternfly/react-core';

export type CDROMRestartRequiredAlertVariant = 'add' | 'mount';

type CDROMRestartRequiredAlertProps = {
  isHotPluggable: boolean;
  isVMRunning: boolean;
  variant: CDROMRestartRequiredAlertVariant;
};

const CDROMRestartRequiredAlert: FC<CDROMRestartRequiredAlertProps> = ({
  isHotPluggable,
  isVMRunning,
  variant,
}) => {
  const { t } = useKubevirtTranslation();

  if (!isVMRunning || isHotPluggable) {
    return null;
  }

  const bodyMessage =
    variant === 'add'
      ? t('To finish adding the CD-ROM drive, restart the virtual machine.')
      : t('To finish mounting the ISO, restart the virtual machine.');

  return (
    <StackItem>
      <PendingChangesAlert title={t('Restart required')}>{bodyMessage}</PendingChangesAlert>
    </StackItem>
  );
};

export default CDROMRestartRequiredAlert;
