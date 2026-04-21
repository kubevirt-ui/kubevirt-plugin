import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubev2v/types';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { KUBEVIRT_UI_VNC_LOG_LEVEL_LABEL } from '@kubevirt-utils/components/Consoles/components/vnc-console/utils/constants';
import { isVncLogLevel } from '@kubevirt-utils/components/Consoles/components/vnc-console/utils/util';
import Consoles from '@kubevirt-utils/components/Consoles/Consoles';
import { getConsoleBasePath } from '@kubevirt-utils/components/Consoles/utils/utils';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sBaseAPIPath from '@multicluster/hooks/useK8sBaseAPIPath';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Bullseye, PageSection, Spinner } from '@patternfly/react-core';

type VirtualMachinesInstancePageConsoleTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageConsoleTab: FC<VirtualMachinesInstancePageConsoleTabProps> = ({
  obj: vmi,
}) => {
  const cluster = getCluster(vmi);
  const [apiPath, apiPathLoaded] = useK8sBaseAPIPath(cluster);
  const [vm, vmLoaded, vmLoadError] = useK8sWatchData<V1VirtualMachine>({
    cluster,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    name: getName(vmi),
    namespace: getNamespace(vmi),
  });

  const waitingForVm = !vmLoaded && !vmLoadError;
  if (!apiPathLoaded || waitingForVm)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );

  const logLevelLabel = vm && getLabel(vm, KUBEVIRT_UI_VNC_LOG_LEVEL_LABEL);
  return (
    <PageSection className="virtual-machine-console-page-section" hasBodyWrapper={false}>
      <Consoles
        path={getConsoleBasePath({
          apiPath,
          name: getName(vmi),
          namespace: getNamespace(vmi),
        })}
        consoleContainerClass="virtual-machine-console-page"
        isHeadlessMode={isHeadlessMode(vmi)}
        isVmRunning={!!vmi}
        isWindowsVM={isWindows(vmi)}
        vmCluster={cluster}
        vmName={getName(vmi)}
        vmNamespace={getNamespace(vmi)}
        vncLogLevel={isVncLogLevel(logLevelLabel) ? logLevelLabel : false}
      />
    </PageSection>
  );
};

export default VirtualMachinesInstancePageConsoleTab;
