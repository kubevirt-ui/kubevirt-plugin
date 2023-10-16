import React, { FC } from 'react';

import { MAX_CPU_SOCKETS } from '@kubevirt-utils/components/CPUMemoryModal/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

import '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert.scss';

type MaxCPUSocketsExceededAlertProps = {
  cpuSockets: number;
};

const MaxCPUSocketsExceededAlert: FC<MaxCPUSocketsExceededAlertProps> = ({ cpuSockets }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Alert
      title={t('Total number of CPU sockets is {{totalCPUSockets}}', {
        totalCPUSockets: cpuSockets,
      })}
      className="pending-changes-alert"
      isInline
      variant={AlertVariant.warning}
    >
      <div>
        {t(
          'You can add a maximum of {{maxCPUSockets}} CPU sockets to a running VirtualMachine. To set a higher number of CPU sockets, you must first shut down the VirtualMachine.',
          { maxCPUSockets: MAX_CPU_SOCKETS },
        )}
      </div>
    </Alert>
  );
};

export default MaxCPUSocketsExceededAlert;
