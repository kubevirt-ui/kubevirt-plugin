import React from 'react';

import { Progress, ProgressSize } from '@patternfly/react-core';

type ActivityProgressProps = {
  title: string;
  progress: number;
};

const ActivityProgress: React.FC<ActivityProgressProps> = ({ title, progress, children }) => (
  <>
    <Progress
      value={progress}
      title={title}
      size={ProgressSize.sm}
      className="co-activity-item__progress"
    />
    <div>{children}</div>
  </>
);

export default ActivityProgress;
