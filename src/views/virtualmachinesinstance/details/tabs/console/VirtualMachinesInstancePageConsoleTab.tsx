import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Consoles from '@kubevirt-utils/components/Consoles/Consoles';
import { getConsoleBasePath } from '@kubevirt-utils/components/Consoles/utils/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getCluster } from '@multicluster/helpers/selectors';
import { Bullseye, PageSection, Spinner } from '@patternfly/react-core';
import { useFleetK8sAPIPath } from '@stolostron/multicluster-sdk';

type VirtualMachinesInstancePageConsoleTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageConsoleTab: FC<VirtualMachinesInstancePageConsoleTabProps> = ({
  obj: vmi,
}) => {
  const cluster = getCluster(vmi);
  const [apiPath, apiPathLoaded] = useFleetK8sAPIPath(cluster);

  if (!apiPathLoaded)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );

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
      />
    </PageSection>
  );
};

export default VirtualMachinesInstancePageConsoleTab;
