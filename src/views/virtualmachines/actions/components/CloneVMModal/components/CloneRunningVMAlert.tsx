import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

type CloneRunningVMAlertProps = {
  isVMRunning: boolean;
  vmName: string;
};

const CloneRunningVMAlert: React.FC<CloneRunningVMAlertProps> = ({ isVMRunning, vmName }) => {
  const { t } = useKubevirtTranslation();
  if (!isVMRunning) {
    return null;
  }
  return (
    <Alert
      title={t(
        'The VirtualMachine {{vmName}} is still running. It will be powered off while cloning.',
        {
          vmName,
        },
      )}
      isInline
      variant={AlertVariant.warning}
    />
  );
};

export default CloneRunningVMAlert;
