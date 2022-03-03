import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { LazyActionMenu } from '@openshift-console/dynamic-plugin-sdk-internal';
import { ActionMenuVariant } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/internal-types';

type VirtualMachinesInsanceActionsProps = { vm: V1VirtualMachine; variant?: ActionMenuVariant };

const VirtualMachineActions: React.FC<VirtualMachinesInsanceActionsProps> = ({
  vm,
  variant = ActionMenuVariant.KEBAB,
}) => (
  <LazyActionMenu
    variant={variant}
    key={vm?.metadata?.name}
    context={{ [VirtualMachineModelRef]: vm }}
  />
);

export default VirtualMachineActions;
