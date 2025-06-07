import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import StableConsole from '@kubevirt-utils/components/Consoles/StableConsole';
import { getConsolePath } from '@kubevirt-utils/components/Consoles/utils/utils';
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
    <StableConsole
      isHeadlessMode={isHeadlessMode(vmi)}
      isVmRunning={!!vmi}
      isWindowsVM={isWindows(vmi)}
      path={getConsolePath({ name: vmi?.metadata?.name, namespace: vmi?.metadata?.namespace })}
    />
  </PageSection>
);

export default VirtualMachinesInstancePageConsoleTab;
