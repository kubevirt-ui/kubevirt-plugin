import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { StatusGroupMapper } from '@openshift-console/dynamic-plugin-sdk';
import { OffIcon } from '@patternfly/react-icons';

import {
  getVmStatusLabelFromPrintable,
  InventoryStatusGroup,
  StatusSimpleLabel,
  VMStatusSimpleLabel,
} from './utils';

import './inventory.scss';

export const getVMStatusGroups: StatusGroupMapper = (vms) => {
  const groups = {
    [InventoryStatusGroup.NOT_MAPPED]: {
      statusIDs: [VMStatusSimpleLabel.Running],
      count: 0,
      filterType: 'vm-status',
    },
    [InventoryStatusGroup.PROGRESS]: {
      statusIDs: [
        StatusSimpleLabel.Importing,
        VMStatusSimpleLabel.Starting,
        VMStatusSimpleLabel.Migrating,
        VMStatusSimpleLabel.Stopping,
        StatusSimpleLabel.Pending,
        VMStatusSimpleLabel.Deleting,
      ],
      count: 0,
      filterType: 'vm-status',
    },
    [InventoryStatusGroup.ERROR]: {
      statusIDs: [StatusSimpleLabel.Error],
      count: 0,
      filterType: 'vm-status',
    },
    [InventoryStatusGroup.WARN]: {
      statusIDs: [VMStatusSimpleLabel.Paused],
      count: 0,
      filterType: 'vm-status',
    },
    [InventoryStatusGroup.UNKNOWN]: {
      statusIDs: [StatusSimpleLabel.Other],
      count: 0,
      filterType: 'vm-status',
    },
    'vm-stopped': {
      statusIDs: [VMStatusSimpleLabel.Stopped],
      count: 0,
      filterType: 'vm-status',
    },
  };

  vms.forEach((vm: V1VirtualMachine) => {
    const group =
      Object.keys(groups).find((key) =>
        groups[key].statusIDs.includes(getVmStatusLabelFromPrintable(vm?.status?.printableStatus)),
      ) || InventoryStatusGroup.UNKNOWN;
    groups[group].count++;
  });

  return groups;
};

export const VMOffGroupIcon: FC = () => (
  <OffIcon className="kubevirt-inventory-card__status-icon--off" />
);
