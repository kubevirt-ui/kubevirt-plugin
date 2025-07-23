import React, { FC } from 'react';

import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon } from '@patternfly/react-icons';

type ReadinessWizardNavItemProps = {
  checked: boolean;
  loaded: boolean;
  title: string;
};

const ReadinessWizardNavItem: FC<ReadinessWizardNavItemProps> = ({ checked, loaded, title }) => {
  let icon = <InProgressIcon />;

  if (loaded && checked) icon = <GreenCheckCircleIcon />;

  if (loaded && !checked) icon = <RedExclamationCircleIcon />;

  return (
    <div>
      {icon} {title}
    </div>
  );
};

export default ReadinessWizardNavItem;
