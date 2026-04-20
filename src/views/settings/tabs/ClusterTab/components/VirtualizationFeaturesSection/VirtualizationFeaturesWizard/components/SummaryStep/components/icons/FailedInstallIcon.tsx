import React, { FCC } from 'react';

import { ExclamationCircleIcon } from '@patternfly/react-icons';

import './virt-wizard-icons.scss';

const FailedInstallIcon: FCC = () => {
  return <ExclamationCircleIcon className="failed-install-icon" />;
};

export default FailedInstallIcon;
