import React from 'react';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import LazyActionMenu from '@kubevirt-utils/components/LazyActionMenu/LazyActionMenu';
import { ActionMenuVariant } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';

type VirtualMachinesInsanceActionsProps = { vmi: V1VirtualMachineInstance };

const VirtualMachinesInsanceActions: React.FC<VirtualMachinesInsanceActionsProps> = ({ vmi }) => {
  return (
    <LazyActionMenu
      context={{ [VirtualMachineInstanceModelRef]: vmi }}
      key={vmi?.metadata?.name}
      variant={ActionMenuVariant.KEBAB}
    />
  );
};

export default VirtualMachinesInsanceActions;
