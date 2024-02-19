import React, { FC } from 'react';
import cn from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Icon } from '@patternfly/react-core';
import { PlayIcon } from '@patternfly/react-icons';

type VirtualMachinesOverviewTabDetailsConsoleConnectProps = {
  connect?: () => void;
  isDisabled?: boolean;
  isHeadlessMode?: boolean;
};

const VirtualMachinesOverviewTabDetailsConsoleConnect: FC<
  VirtualMachinesOverviewTabDetailsConsoleConnectProps
> = ({ connect, isDisabled, isHeadlessMode }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className={cn('vnc-grey-background', isDisabled && 'disabled')}>
      {!isDisabled && (
        <Icon onClick={connect} size="md">
          <PlayIcon />
        </Icon>
      )}
      {isHeadlessMode && t('Console is disabled in headless mode')}
    </div>
  );
};

export default VirtualMachinesOverviewTabDetailsConsoleConnect;
