import React, { FC } from 'react';
import cn from 'classnames';

import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Icon } from '@patternfly/react-core';
import { LockIcon, PlayIcon } from '@patternfly/react-icons';

type VirtualMachinesOverviewTabDetailsConsoleConnectProps = {
  connect?: () => void;
  isConnecting?: boolean;
  isDisabled?: boolean;
  isHeadlessMode?: boolean;
  isSessionAlreadyInUse?: boolean;
};

const VirtualMachinesOverviewTabDetailsConsoleConnect: FC<
  VirtualMachinesOverviewTabDetailsConsoleConnectProps
> = ({ connect, isConnecting, isDisabled, isHeadlessMode, isSessionAlreadyInUse }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="vnc-no-connection-placeholder">
      {isConnecting && <LoadingEmptyState bodyContents={t('Connecting')} />}
      {!isConnecting && (
        <div className={cn('vnc-grey-background', isDisabled && 'disabled')}>
          {!isDisabled && (
            <Icon onClick={connect} size="md">
              {isSessionAlreadyInUse ? <LockIcon /> : <PlayIcon />}
            </Icon>
          )}
          {isHeadlessMode && t('Console is disabled in headless mode')}
        </div>
      )}
    </div>
  );
};

export default VirtualMachinesOverviewTabDetailsConsoleConnect;
