import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { KUBEVIRT_UI_VNC_LOG_LEVEL_LABEL } from '@kubevirt-utils/components/Consoles/components/vnc-console/utils/constants';
import { isVncLogLevel } from '@kubevirt-utils/components/Consoles/components/vnc-console/utils/util';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

import VirtualMachinesOverviewTabDetailsConsole from './VirtualMachinesOverviewTabDetailsConsole';

const VirtualMachinesOverviewTabDetailsConsoleWrapper: FC<{
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
}> = ({ vm, vmi }) => {
  const [canConnectConsole] = useFleetAccessReview({
    cluster: getCluster(vmi),
    group: 'subresources.kubevirt.io',
    name: vmi?.metadata?.name,
    namespace: vmi?.metadata?.namespace,
    resource: 'virtualmachineinstances/vnc',
    verb: 'get',
  });
  const headlesMode = isHeadlessMode(vmi);
  const runningVM = !!vmi;

  const logLevelLabel = getLabel(vm, KUBEVIRT_UI_VNC_LOG_LEVEL_LABEL);
  return (
    <VirtualMachinesOverviewTabDetailsConsole
      canConnectConsole={canConnectConsole}
      isHeadlessMode={headlesMode}
      isVMRunning={runningVM}
      vmCluster={getCluster(vmi)}
      vmName={getName(vmi)}
      vmNamespace={getNamespace(vmi)}
      vncLogLevel={isVncLogLevel(logLevelLabel) ? logLevelLabel : false}
    />
  );
};

export default VirtualMachinesOverviewTabDetailsConsoleWrapper;
