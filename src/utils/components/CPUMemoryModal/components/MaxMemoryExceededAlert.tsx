import React, { FC } from 'react';

import { MAX_MEMORY } from '@kubevirt-utils/components/CPUMemoryModal/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { toIECUnit } from '@kubevirt-utils/utils/units';
import { Alert, AlertVariant } from '@patternfly/react-core';

import '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert.scss';

type MaxMemoryExceededAlertProps = {
  memory: number;
  memoryUnit: string;
};

const MaxMemoryExceededAlert: FC<MaxMemoryExceededAlertProps> = ({ memory, memoryUnit }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Alert
      title={t('Total memory is {{totalMemory}}', {
        totalMemory: `${memory}${toIECUnit(memoryUnit)}`,
      })}
      className="pending-changes-alert"
      isInline
      variant={AlertVariant.warning}
    >
      <div>
        {t(
          'You can add a maximum of {{maxMemory}} memory to a running VirtualMachine. To set a higher amount of memory, you must first shut down the VirtualMachine.',
          { maxMemory: `${MAX_MEMORY}B` },
        )}
      </div>
    </Alert>
  );
};

export default MaxMemoryExceededAlert;
