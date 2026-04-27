import React, { FC, ReactNode } from 'react';

import { Progress, ProgressSize } from '@patternfly/react-core';

type ActivityProgressProps = {
  children?: ReactNode;
  progress: number;
  title: string;
};

const ActivityProgress: FC<ActivityProgressProps> = ({ children, progress, title }) => (
  <>
    <Progress
      className="co-activity-item__progress"
      size={ProgressSize.sm}
      title={title}
      value={progress}
    />
    <div>{children}</div>
  </>
);

export default ActivityProgress;
