import React, { FC } from 'react';

import VmNotRunning from '@kubevirt-utils/components/Consoles/components/VmNotRunning';
import Consoles from '@kubevirt-utils/components/Consoles/Consoles';
import { getConsoleBasePath } from '@kubevirt-utils/components/Consoles/utils/utils';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { PageSection } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import { isRunning, printableVMStatus } from '../../../utils';

const VirtualMachineConsolePage: FC<NavPageComponentProps> = ({ obj: vm }) => {
  const { vmi, vmiLoaded } = useVMI(vm?.metadata?.name, vm?.metadata?.namespace, isRunning(vm));

  if (vmiLoaded && (!vmi || vm?.status?.printableStatus === printableVMStatus.Stopped)) {
    return <VmNotRunning />;
  }

  return (
    <PageSection className="virtual-machine-console-page-section" hasBodyWrapper={false}>
      <Consoles
        consoleContainerClass="virtual-machine-console-page"
        isHeadlessMode={isHeadlessMode(vmi)}
        isVmRunning={true}
        isWindowsVM={isWindows(vmi)}
        path={getConsoleBasePath({ name: vm?.metadata?.name, namespace: vm?.metadata?.namespace })}
        vmName={vm?.metadata?.name}
        vmNamespace={vm?.metadata?.namespace}
      />
    </PageSection>
  );
};

export default VirtualMachineConsolePage;
