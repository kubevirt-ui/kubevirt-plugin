import React, { type FC } from 'react';
import classnames from 'classnames';

import useCurrentTime from '@kubevirt-utils/hooks/useCurrentTime';
import { pluralize, Tooltip } from '@patternfly/react-core';
import { GlobeAmericasIcon } from '@patternfly/react-icons';

import { isValid, timestampFor, utcDateTimeFormatter } from './utils/datetime';

export type TimestampProps = {
  className?: string;
  hideIcon?: boolean;
  omitSuffix?: boolean;
  timestamp: number | string;
};

const Timestamp: FC<TimestampProps> = ({ className, hideIcon = false, omitSuffix, timestamp }) => {
  const currentTime = useCurrentTime(60_000);
  const now = new Date(currentTime);

  if (!timestamp || !isValid(new Date(timestamp))) {
    return <div className="co-timestamp">-</div>;
  }

  const mdate = new Date(timestamp);

  const newTimestamp = timestampFor(mdate, now, omitSuffix);

  const timeStamp = omitSuffix
    ? pluralize(newTimestamp['value'], newTimestamp['time'])
    : newTimestamp;

  return (
    <div className={classnames('co-timestamp', 'co-icon-and-text', className)}>
      {!hideIcon && <GlobeAmericasIcon className="co-icon-and-text__icon" />}
      <Tooltip
        content={[
          <span className="co-nowrap" key="co-timestamp">
            {utcDateTimeFormatter.format(mdate)}
          </span>,
        ]}
      >
        <span>{timeStamp}</span>
      </Tooltip>
    </div>
  );
};

export default Timestamp;
