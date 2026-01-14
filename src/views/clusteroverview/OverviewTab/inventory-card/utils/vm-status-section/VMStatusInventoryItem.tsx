import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { getVMListPathWithRowFilters } from '@kubevirt-utils/resources/vm/utils/utils';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';

import { getVMStatusIcon } from '../utils';

import './VMStatusInventoryItem.scss';

export type VMStatusInventoryItemProps = {
  count: number;
  status: string;
};

const VMStatusInventoryItem: React.FC<VMStatusInventoryItemProps> = ({ count, status }) => {
  const cluster = useActiveClusterParam();
  const Icon = getVMStatusIcon(status);
  const to = getVMListPathWithRowFilters(ALL_NAMESPACES, { status }, cluster);

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
