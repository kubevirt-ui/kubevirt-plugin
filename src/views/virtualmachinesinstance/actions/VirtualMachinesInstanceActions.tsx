import React from 'react';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionMenuVariant } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { LazyActionMenu } from '@openshift-console/dynamic-plugin-sdk-internal';

type VirtualMachinesInstanceActionsProps = { vmi: V1VirtualMachineInstance; isKebab?: boolean };

const VirtualMachinesInstanceActions: React.FC<VirtualMachinesInstanceActionsProps> = ({
  vmi,
  isKebab,
}) => {
  return (
    <div id="VirtualMachinesInstanceActions">
      <LazyActionMenu
        variant={isKebab ? ActionMenuVariant.KEBAB : ActionMenuVariant.DROPDOWN}
        key={vmi?.metadata?.name}
        context={{ [VirtualMachineInstanceModelRef]: vmi }}
      />
    </div>
  );
};

export default VirtualMachinesInstanceActions;
