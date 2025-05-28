import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Consoles from '@kubevirt-utils/components/Consoles/Consoles';
import { getConsoleBasePath } from '@kubevirt-utils/components/Consoles/utils/utils';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { PageSection } from '@patternfly/react-core';

type VirtualMachinesInstancePageConsoleTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageConsoleTab: FC<VirtualMachinesInstancePageConsoleTabProps> = ({
  obj: vmi,
}) => (
  <PageSection>
    <Consoles
      isHeadlessMode={isHeadlessMode(vmi)}
      isVmRunning={!!vmi}
      isWindowsVM={isWindows(vmi)}
      path={getConsoleBasePath({ name: vmi?.metadata?.name, namespace: vmi?.metadata?.namespace })}
      vmName={vmi?.metadata?.name}
      vmNamespace={vmi?.metadata?.namespace}
    />
  </PageSection>
);

export default VirtualMachinesInstancePageConsoleTab;
