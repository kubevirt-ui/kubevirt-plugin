import * as React from 'react';
import classnames from 'classnames';

import { pluralize, Tooltip } from '@patternfly/react-core';
import { GlobeAmericasIcon } from '@patternfly/react-icons';

import { isValid, timestampFor, utcDateTimeFormatter } from './utils/datetime';

export type TimestampProps = {
  timestamp: string | number;
  omitSuffix?: boolean;
  className?: string;
  hideIcon?: boolean;
};

const Timestamp: React.FC<TimestampProps> = ({
  timestamp,
  omitSuffix,
  className,
  hideIcon = false,
}) => {
  // Check for null. If props.timestamp is null, it returns incorrect date and time of Wed Dec 31 1969 19:00:00 GMT-0500 (Eastern Standard Time)
  if (!timestamp || !isValid(new Date(timestamp))) {
    return <div className="co-timestamp">-</div>;
  }

  const mdate = new Date(timestamp);

  const newTimestamp = timestampFor(mdate, new Date(Date.now()), omitSuffix);

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
        <span data-test="timestamp">{timeStamp}</span>
      </Tooltip>
    </div>
  );
};

export default Timestamp;
