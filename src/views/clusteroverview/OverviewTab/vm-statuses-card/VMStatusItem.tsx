import * as React from 'react';
import { Link } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { GridItem } from '@patternfly/react-core';

import { ERROR } from './utils/constants';
import { vmStatusIcon } from './utils/utils';

import './VMStatusesCard.scss';

type VMStatusItemProps = {
  status: string;
  count: number;
  namespace?: string;
};

const VMStatusItem: React.FC<VMStatusItemProps> = ({ status, count, namespace }) => {
  const Icon = vmStatusIcon[status];
  const path = `/k8s/ns/${
    namespace || ALL_NAMESPACES
  }/${VirtualMachineModelRef}?rowFilter-status=${status}`;

  return (
    <GridItem span={3} className="vm-statuses-card__grid-item">
      <div className="vm-statuses-card__status-item">
        <div className="vm-statuses-card__status-item--count">
          <span className="vm-statuses-card__status-item--icon">
            <Icon />
          </span>
          <span className="vm-statuses-card__status-item--value">
            {status !== ERROR ? <Link to={path}>{count.toString()}</Link> : count.toString()}
          </span>
        </div>
        <div className="vm-statuses-card__status-item--status">{status}</div>
      </div>
    </GridItem>
  );
};

export default VMStatusItem;
