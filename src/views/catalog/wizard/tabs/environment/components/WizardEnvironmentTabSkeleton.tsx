import * as React from 'react';

import { Skeleton, Stack, StackItem } from '@patternfly/react-core';

import WizardEnvironmentTabTitle from './WizardEnvironmentTabTitle';

const WizardEnvironmentTabSkeleton: React.FC = React.memo(() => (
  <div className="co-m-pane__body">
    <Stack hasGutter>
      <WizardEnvironmentTabTitle />
      <StackItem />
      <Skeleton width="80%" height="40px" />
      <Skeleton width="40%" height="30px" />
    </Stack>
  </div>
));
WizardEnvironmentTabSkeleton.displayName = 'WizardEnvironmentTabSkeleton';

export default WizardEnvironmentTabSkeleton;
