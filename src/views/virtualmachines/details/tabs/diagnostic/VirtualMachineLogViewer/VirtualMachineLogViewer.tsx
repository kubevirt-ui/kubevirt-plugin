import React from 'react';

import { V1Devices } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getChangedGuestSystemAccessLog } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { DISABLED_GUEST_SYSTEM_LOGS_ACCESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeatureReadOnly from '@kubevirt-utils/hooks/useFeatures/useFeatureReadOnly';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDevices, useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import { Bullseye, spinnerSize } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import useVirtualMachineLogData from './hooks/useVirtualMachineLogData';
import VirtualMachineBasicLogViewer from './VirtualMachineBasicLogViewer/VirtualMachineBasicLogViewer';

const VirtualMachineLogViewer = ({ connect, vm }) => {
  const { t } = useKubevirtTranslation();
  const { loaded, pods, vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const pod = getVMIPod(vmi, pods);
  const { featureEnabled: isClusterDisabledGuestSystemLogs } = useFeatureReadOnly(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );

  const isDisabledAtVM =
    (getDevices(vm) as V1Devices & { logSerialConsole: boolean })?.logSerialConsole === false &&
    !isClusterDisabledGuestSystemLogs;

  const isNeededRestart = getChangedGuestSystemAccessLog(vm, vmi);

  const isPodLogContainerExist = Boolean(
    pod?.spec?.containers?.find((container) => container?.name === 'guest-console-log'),
  );

  const { data } = useVirtualMachineLogData({ connect: connect && isPodLogContainerExist, pod });

  if (!loaded) {
    return (
      <Bullseye>
        <Loading size={spinnerSize.xl} />
      </Bullseye>
    );
  }

  if (!isRunning(vm)) {
    return <Bullseye>{t('Virtual machine is not running')}</Bullseye>;
  }

  if (isClusterDisabledGuestSystemLogs) {
    return <Bullseye>{t('Guest system logs are disabled at cluster')}</Bullseye>;
  }

  if (isNeededRestart || !isPodLogContainerExist) {
    return <Bullseye>{t('Guest system logs not ready. Restart required')}</Bullseye>;
  }

  if (isDisabledAtVM) {
    return <Bullseye>{t('Guest system logs are disabled at VirtualMachine')}</Bullseye>;
  }

  return <VirtualMachineBasicLogViewer data={data} vmi={vmi} />;
};

export default VirtualMachineLogViewer;
