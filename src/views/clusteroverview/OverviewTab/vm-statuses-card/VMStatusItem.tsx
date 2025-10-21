import * as React from 'react';
import { Link, useLocation } from 'react-router-dom-v5-compat';

import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { ERROR } from '@overview/OverviewTab/vm-statuses-card/utils/constants';
import { GridItem } from '@patternfly/react-core';

import { getVMStatusesPath, vmStatusIcon } from './utils/utils';

import './VMStatusesCard.scss';

type VMStatusItemProps = {
  count: number;
  namespace?: string;
  onFilterChange?: () => void;
  showIcon?: boolean;
  statusArray: typeof ERROR[] | VM_STATUS[];
  statusLabel: string;
};

const VMStatusItem: React.FC<VMStatusItemProps> = ({
  count,
  onFilterChange,
  showIcon = true,
  statusArray,
  statusLabel,
}) => {
  const Icon = vmStatusIcon[statusLabel];
  const location = useLocation();
  const path = getVMStatusesPath(location, statusArray);

  return (
    <GridItem className="vm-statuses-card__grid-item" span={3}>
      <div className="vm-statuses-card__status-item">
        <div className="vm-statuses-card__status-item--count">
          <span className="vm-statuses-card__status-item--icon">
            {Icon && showIcon && <Icon />}
          </span>
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
        <div className="vm-statuses-card__status-item--status">{statusLabel}</div>
      </div>
    </GridItem>
  );
};

export default VMStatusItem;
