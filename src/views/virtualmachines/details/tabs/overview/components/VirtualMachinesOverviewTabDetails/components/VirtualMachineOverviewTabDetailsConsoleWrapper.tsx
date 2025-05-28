import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

import VirtualMachinesOverviewTabDetailsConsole from './VirtualMachinesOverviewTabDetailsConsole';

const VirtualMachinesOverviewTabDetailsConsoleWrapper: FC<{ vmi: V1VirtualMachineInstance }> = ({
  vmi,
}) => {
  const [canConnectConsole] = useAccessReview({
    group: 'subresources.kubevirt.io',
    name: vmi?.metadata?.name,
    namespace: vmi?.metadata?.namespace,
    resource: 'virtualmachineinstances/vnc',
    verb: 'get',
  });
  const headlesMode = isHeadlessMode(vmi);
  const runningVM = !!vmi;

  return (
    <VirtualMachinesOverviewTabDetailsConsole
      canConnectConsole={canConnectConsole}
      isHeadlessMode={headlesMode}
      isVMRunning={runningVM}
      vmName={vmi?.metadata?.name}
      vmNamespace={vmi?.metadata?.namespace}
    />
  );
};

export default VirtualMachinesOverviewTabDetailsConsoleWrapper;
