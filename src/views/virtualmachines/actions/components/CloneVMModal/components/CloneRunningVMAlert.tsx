import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

type CloneRunningVMAlertProps = {
  vmName: string;
  isVMRunning: boolean;
};

const CloneRunningVMAlert: React.FC<CloneRunningVMAlertProps> = ({ vmName, isVMRunning }) => {
  const { t } = useKubevirtTranslation();
  if (!isVMRunning) {
    return null;
  }
  return (
    <Alert
      title={t('The VM {{vmName}} is still running. It will be powered off while cloning.', {
        vmName,
      })}
      variant={AlertVariant.warning}
      isInline
    />
  );
};

export default CloneRunningVMAlert;
