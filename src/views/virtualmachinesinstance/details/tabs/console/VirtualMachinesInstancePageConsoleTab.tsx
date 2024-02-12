import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Consoles from '@kubevirt-utils/components/Consoles/Consoles';
import { PageSection } from '@patternfly/react-core';

type VirtualMachinesInstancePageConsoleTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageConsoleTab: FC<VirtualMachinesInstancePageConsoleTabProps> = ({
  obj: vmi,
}) => {
  return (
    <PageSection>
      <Consoles vmi={vmi} />
    </PageSection>
  );
};

export default VirtualMachinesInstancePageConsoleTab;
