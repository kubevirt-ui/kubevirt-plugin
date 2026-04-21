import React, { FC } from 'react';

import { ExclamationCircleIcon } from '@patternfly/react-icons';

import './virt-wizard-icons.scss';

const FailedInstallIcon: FC = () => {
  return <ExclamationCircleIcon className="failed-install-icon" />;
};

export default FailedInstallIcon;
