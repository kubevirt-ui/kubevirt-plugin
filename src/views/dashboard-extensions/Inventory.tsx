import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { StatusGroupMapper } from '@openshift-console/dynamic-plugin-sdk';
import { OffIcon } from '@patternfly/react-icons';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

import {
  getVmStatusLabelFromPrintable,
  InventoryStatusGroup,
  StatusSimpleLabel,
  VMStatusSimpleLabel,
} from './utils';

import './inventory.scss';

export const getVMStatusGroups: StatusGroupMapper = (vms) => {
  const filterType = VirtualMachineRowFilterType.Status;

  const groups = {
    [InventoryStatusGroup.ERROR]: {
      count: 0,
      filterType,
      statusIDs: [StatusSimpleLabel.Error],
    },
    [InventoryStatusGroup.NOT_MAPPED]: {
      count: 0,
      filterType,
      statusIDs: [VMStatusSimpleLabel.Running],
    },
    [InventoryStatusGroup.PROGRESS]: {
      count: 0,
      filterType,
      statusIDs: [
        StatusSimpleLabel.Importing,
        VMStatusSimpleLabel.Starting,
        VMStatusSimpleLabel.Migrating,
        VMStatusSimpleLabel.Stopping,
        StatusSimpleLabel.Pending,
        VMStatusSimpleLabel.Deleting,
      ],
    },
    [InventoryStatusGroup.UNKNOWN]: {
      count: 0,
      filterType,
      statusIDs: [StatusSimpleLabel.Other],
    },
    [InventoryStatusGroup.WARN]: {
      count: 0,
      filterType,
      statusIDs: [VMStatusSimpleLabel.Paused],
    },
    'vm-stopped': {
      count: 0,
      filterType,
      statusIDs: [VMStatusSimpleLabel.Stopped],
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
