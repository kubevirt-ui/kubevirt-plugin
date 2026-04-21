import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { GridItem, Skeleton, Tooltip } from '@patternfly/react-core';

import CountContent from './CountContent';

import './StatusCountItem.scss';

type StatusCountItemProps = {
  className?: string;
  count?: number | string;
  helpContent?: ReactNode;
  href?: string;
  icon?: ReactNode;
  isExternal?: boolean;
  isLoading?: boolean;
  label: string;
  span?: 3 | 4 | 6;
  statusMessage?: string;
  tooltip?: ReactNode;
};

export const getLinkProps = (
  url: string | undefined,
  isExternal: boolean,
): Pick<StatusCountItemProps, 'href' | 'isExternal'> => ({ href: url, isExternal });

const StatusCountItem: FC<StatusCountItemProps> = ({
  className,
  count,
  helpContent,
  href,
  icon,
  isExternal,
  isLoading,
  label,
  span = 4,
  statusMessage,
  tooltip,
}) => {
  const displayValue = count ?? statusMessage;
  const linkAriaLabel = href ? `${label}: ${displayValue}` : undefined;

  const countContent = (
    <CountContent
      ariaLabel={linkAriaLabel}
      displayValue={displayValue}
      href={href}
      isExternal={isExternal}
      statusMessage={statusMessage}
    />
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
        <div className="status-count-item__label">
          {label}
          {helpContent && (
            <HelpTextIcon
              bodyContent={helpContent}
              helpIconClassName="status-count-item__help-icon"
            />
          )}
        </div>
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
