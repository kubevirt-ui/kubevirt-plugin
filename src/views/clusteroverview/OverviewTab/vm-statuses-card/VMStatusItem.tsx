import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import { GridItem } from '@patternfly/react-core';

import { vmStatusIcon } from './utils/utils';

import './VMStatusesCard.scss';

type VMStatusItemProps = {
  count: number;
  namespace?: string;
  onFilterChange?: () => void;
  status: string;
};

const VMStatusItem: React.FC<VMStatusItemProps> = ({
  count,
  namespace,
  onFilterChange,
  status,
}) => {
  const Icon = vmStatusIcon[status];
  const path = `/k8s/${
    isAllNamespaces(namespace) ? ALL_NAMESPACES : `ns/${namespace}`
  }/${VirtualMachineModelRef}?rowFilter-status=${status}`;

  return (
    <GridItem className="vm-statuses-card__grid-item" span={3}>
      <div className="vm-statuses-card__status-item">
        <div className="vm-statuses-card__status-item--count">
          <span className="vm-statuses-card__status-item--icon">{Icon && <Icon />}</span>
          <span className="vm-statuses-card__status-item--value">
            <Link
              onClick={() => {
                onFilterChange?.();
              }}
              to={path}
            >
              {count.toString()}
            </Link>
          </span>
        </div>
        <div className="vm-statuses-card__status-item--status">{status}</div>
      </div>
    </GridItem>
  );
};

export default VMStatusItem;
