import React, { FC } from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type VMINameCellProps = {
  row: V1VirtualMachineInstance;
};

const VMINameCell: FC<VMINameCellProps> = ({ row }) => {
  const name = getName(row);
  const namespace = getNamespace(row);

  return (
    <ResourceLink
      data-test={`vmi-name-${name}`}
      groupVersionKind={VirtualMachineInstanceModelGroupVersionKind}
      name={name}
      namespace={namespace}
    />
  );
};

export default VMINameCell;
