import * as React from 'react';
import { Link } from 'react-router-dom';

import { getVMStatusIcon } from '../utils';

import './VMStatusInventoryItem.scss';

export type VMStatusInventoryItemProps = {
  status: string;
  count: number;
};

const VMStatusInventoryItem: React.FC<VMStatusInventoryItemProps> = ({ status, count }) => {
  const Icon = getVMStatusIcon(status);
  const to = `/k8s/all-namespaces/virtualization?rowFilter-vm-status=${status}`;

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
