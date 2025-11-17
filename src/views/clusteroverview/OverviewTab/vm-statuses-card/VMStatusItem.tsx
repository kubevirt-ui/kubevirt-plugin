import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import {
  getACMMListPathWithRowFilters,
  getVMListPathWithRowFilters,
} from '@kubevirt-utils/resources/vm/utils/utils';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ERROR } from '@overview/OverviewTab/vm-statuses-card/utils/constants';
import { FlexItem, GridItem } from '@patternfly/react-core';

import { vmStatusIcon } from './utils/utils';

import './VMStatusesCard.scss';

type VMStatusItemProps = {
  count: number;
  isFlexItem?: boolean;
  namespace?: string;
  onFilterChange?: () => void;
  showIcon?: boolean;
  statusArray: typeof ERROR[] | VM_STATUS[];
  statusLabel: string;
};

const VMStatusItem: React.FC<VMStatusItemProps> = ({
  count,
  isFlexItem = false,
  namespace,
  onFilterChange,
  showIcon = true,
  statusArray,
  statusLabel,
}) => {
  const Icon = vmStatusIcon[statusLabel];
  const cluster = useClusterParam();
  const isACMPage = useIsACMPage();
  const path = isACMPage
    ? getACMMListPathWithRowFilters(cluster, namespace, { status: statusArray.join(',') })
    : getVMListPathWithRowFilters(namespace, { status: statusArray.join(',') });

  const Component = isFlexItem ? FlexItem : GridItem;

  return (
    <Component
      className={isFlexItem ? null : 'vm-statuses-card__grid-item'}
      span={isFlexItem ? null : 3}
    >
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
              id={`count-vm-status-${statusLabel}`}
              to={path}
            >
              {count.toString()}
            </Link>
          </span>
        </div>
        <div className="vm-statuses-card__status-item--status">{statusLabel}</div>
      </div>
    </Component>
  );
};

export default VMStatusItem;
