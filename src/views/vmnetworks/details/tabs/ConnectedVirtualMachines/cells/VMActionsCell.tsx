import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { Action } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/actions';

type VMActionsCellProps = {
  getActions: (vms: V1VirtualMachine[]) => Action[];
  row: V1VirtualMachine;
};

const VMActionsCell: FC<VMActionsCellProps> = ({ getActions, row }) => {
  const actions = getActions([row]);
  const actionId =
    getUID(row) ?? `${getNamespace(row)}-${getName(row)}`.replace(/[^a-zA-Z0-9-_]/g, '-');

  return <ActionsDropdown actions={actions} id={`vm-actions-${actionId}`} isKebabToggle />;
};

export default VMActionsCell;
