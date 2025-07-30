import React, { FC, useMemo } from 'react';

import VmNotRunning from '@kubevirt-utils/components/Consoles/components/VmNotRunning';
import Consoles from '@kubevirt-utils/components/Consoles/Consoles';
import { getConsoleBasePath } from '@kubevirt-utils/components/Consoles/utils/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sBaseAPIPath from '@multicluster/hooks/useK8sBaseAPIPath';
import { Bullseye, PageSection, Spinner } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import { isRunning, isStopped } from '../../../utils';

const VirtualMachineConsolePage: FC<NavPageComponentProps> = ({ obj: vm }) => {
  const cluster = getCluster(vm);
  const name = getName(vm);
  const namespace = getNamespace(vm);

  const [apiPath, apiPathLoaded] = useK8sBaseAPIPath(cluster);

  const { vmi, vmiLoaded } = useVMI(name, namespace, cluster, isRunning(vm));

  const loading = !apiPathLoaded || !vmiLoaded;
  const notRunning = vmiLoaded && (!vmi || isStopped(vm));

  return useMemo(() => {
    if (notRunning) {
      return <VmNotRunning />;
    }

    if (loading)
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
            name,
            namespace,
          })}
          consoleContainerClass="virtual-machine-console-page"
          isHeadlessMode={isHeadlessMode(vmi)}
          isVmRunning={true}
          isWindowsVM={isWindows(vmi)}
          vmCluster={cluster}
          vmName={name}
          vmNamespace={namespace}
        />
      </PageSection>
    );
  }, [apiPath, cluster, loading, name, namespace, notRunning, vmi]);
};

export default VirtualMachineConsolePage;
