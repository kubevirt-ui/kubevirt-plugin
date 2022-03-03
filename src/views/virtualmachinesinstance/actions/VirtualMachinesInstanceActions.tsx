import * as React from 'react';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { LazyActionMenu } from '@openshift-console/dynamic-plugin-sdk-internal';
import { ActionMenuVariant } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/internal-types';

type VirtualMachinesInsanceActionsProps = { vmi: V1VirtualMachineInstance };

const VirtualMachinesInsanceActions: React.FC<VirtualMachinesInsanceActionsProps> = ({ vmi }) => {
  return (
    <LazyActionMenu
      variant={ActionMenuVariant.KEBAB}
      key={vmi?.metadata?.name}
      context={{ [VirtualMachineInstanceModelRef]: vmi }}
    />
  );
};

export default VirtualMachinesInsanceActions;
