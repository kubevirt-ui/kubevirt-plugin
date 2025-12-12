import React, { FC } from 'react';

import { Badge } from '@patternfly/react-core';

type ResourceCountProps = {
  count: number;
  label: string;
};

const ResourceCount: FC<ResourceCountProps> = ({ count, label }) => {
  return (
    <div>
      <Badge>{count}</Badge>
      <span className="pf-v6-u-ml-sm">{label}</span>
    </div>
  );
};

export default ResourceCount;
