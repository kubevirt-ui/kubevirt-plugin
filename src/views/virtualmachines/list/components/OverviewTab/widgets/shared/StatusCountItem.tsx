import React, { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import { GridItem, Skeleton, Tooltip } from '@patternfly/react-core';

import './StatusCountItem.scss';

type StatusCountItemProps = {
  className?: string;
  count?: number | string;
  icon?: ReactNode;
  isLoading?: boolean;
  label: string;
  linkPath?: string;
  span?: 3 | 4 | 6;
  statusMessage?: string;
  tooltip?: ReactNode;
};

const StatusCountItem: FC<StatusCountItemProps> = ({
  className,
  count,
  icon,
  isLoading,
  label,
  linkPath,
  span = 4,
  statusMessage,
  tooltip,
}) => {
  const displayValue = count ?? statusMessage;

  const countContent = linkPath ? (
    <Link className="status-count-item__link" to={linkPath}>
      {displayValue}
    </Link>
  ) : (
    <span className={statusMessage ? 'status-count-item__text' : 'status-count-item__count'}>
      {displayValue}
    </span>
  );

  const wrappedCount = tooltip ? (
    <Tooltip content={tooltip} isContentLeftAligned>
      <span className="status-count-item__tooltip-trigger" tabIndex={0}>
        {countContent}
      </span>
    </Tooltip>
  ) : (
    countContent
  );

  return (
    <GridItem className={classNames('status-count-item__grid-item', className)} span={span}>
      <div
        className="status-count-item"
        data-test={`status-count-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="status-count-item__label">{label}</div>
        <div className="status-count-item__value">
          {isLoading ? (
            <Skeleton width="40px" />
          ) : (
            <>
              {icon && <span className="status-count-item__icon">{icon}</span>}
              {wrappedCount}
            </>
          )}
        </div>
      </div>
    </GridItem>
  );
};

export default StatusCountItem;
