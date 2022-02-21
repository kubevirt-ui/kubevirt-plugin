import * as React from 'react';

import { Skeleton } from '@patternfly/react-core';

const skeletons = Array.from({ length: 12 }, (_, k: number) => (
  <div key={k}>
    <br />
    <Skeleton />
  </div>
));

export const CustomizeVirtualMachineScheleton = () => (
  <div data-test-id="scheleton">{skeletons}</div>
);
