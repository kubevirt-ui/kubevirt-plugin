import React, { type FC } from 'react';
import { Link } from 'react-router';

import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { getVMListPathWithFilters } from '@kubevirt-utils/resources/vm/utils/utils';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';

import { iconMap } from '../utils';

import './VMStatusInventoryItem.scss';

export type VMStatusInventoryItemProps = {
  count: number;
  status: string;
};

const VMStatusInventoryItem: FC<VMStatusInventoryItemProps> = ({ count, status }) => {
  const cluster = useActiveClusterParam();
  const vmListPath = getVMListPathWithFilters(ALL_NAMESPACES, { status }, cluster);
  const StatusIcon = iconMap[status as keyof typeof iconMap] ?? iconMap.Unknown;

  return (
    <div className="co-inventory-card__status">
      <span className="co-dashboard-icon kv-inventory-card__status-icon">
        <StatusIcon />
      </span>
      <Link to={vmListPath}>
        <span className="kv-inventory-card__status-text">{count}</span>
      </Link>
      <span>{status}</span>
    </div>
  );
};

export default VMStatusInventoryItem;
