import React, { FCC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { modelToGroupVersionKind, VirtualMachineModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type VMNameCellProps = {
  row: V1VirtualMachine;
};

const VMNameCell: FCC<VMNameCellProps> = ({ row }) => {
  const name = getName(row);
  const namespace = getNamespace(row);

  if (!name || !namespace) {
    return <span data-test="vm-name">{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`vm-name-${name}`}>
      <ResourceLink
        groupVersionKind={modelToGroupVersionKind(VirtualMachineModel)}
        name={name}
        namespace={namespace}
      />
    </span>
  );
};

export default VMNameCell;
