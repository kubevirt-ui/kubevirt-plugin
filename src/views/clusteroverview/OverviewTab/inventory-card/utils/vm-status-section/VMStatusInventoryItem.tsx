import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';

import { getVMStatusIcon } from '../utils';

import './VMStatusInventoryItem.scss';

export type VMStatusInventoryItemProps = {
  count: number;
  status: string;
};

const VMStatusInventoryItem: React.FC<VMStatusInventoryItemProps> = ({ count, status }) => {
  const Icon = getVMStatusIcon(status);
  const to = `/k8s/all-namespaces/${VirtualMachineModelRef}?rowFilter-status=${status}`;

  return (
    <div className="co-inventory-card__status">
      <span className="co-dashboard-icon kv-inventory-card__status-icon">{<Icon />}</span>
      <Link to={to}>
        <span className="kv-inventory-card__status-text">{count}</span>
      </Link>
      <span>{status}</span>
    </div>
  );
};

export default VMStatusInventoryItem;
