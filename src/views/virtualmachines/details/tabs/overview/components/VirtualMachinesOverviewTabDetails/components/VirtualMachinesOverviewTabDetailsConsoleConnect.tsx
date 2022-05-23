import React from 'react';
import cn from 'classnames';

import { PlayIcon } from '@patternfly/react-icons';

type VirtualMachinesOverviewTabDetailsConsoleConnectProps = {
  connect?: () => void;
  isDisabled?: boolean;
};

const VirtualMachinesOverviewTabDetailsConsoleConnect: React.FC<
  VirtualMachinesOverviewTabDetailsConsoleConnectProps
> = ({ connect, isDisabled }) => {
  return (
    <div className={cn('vnc-grey-background', isDisabled && 'disabled')}>
      <PlayIcon size="md" onClick={connect} />
    </div>
  );
};

export default VirtualMachinesOverviewTabDetailsConsoleConnect;
