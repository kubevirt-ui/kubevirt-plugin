import type { FC } from 'react';

import type {
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { KUBEVIRT_UI_VNC_LOG_LEVEL_LABEL } from '@kubevirt-utils/components/Consoles/components/vnc-console/utils/constants';
import { isVncLogLevel } from '@kubevirt-utils/components/Consoles/components/vnc-console/utils/util';
import useCanConnectConsole from '@kubevirt-utils/components/Consoles/hooks/useCanConnectConsole';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';

import VirtualMachinesOverviewTabDetailsConsole from './VirtualMachinesOverviewTabDetailsConsole';

const VirtualMachinesOverviewTabDetailsConsoleWrapper: FC<{
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
}> = ({ vm, vmi }) => {
  const [canConnectConsole] = useCanConnectConsole(
    getName(vmi),
    getNamespace(vmi),
    getCluster(vmi),
  );
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
