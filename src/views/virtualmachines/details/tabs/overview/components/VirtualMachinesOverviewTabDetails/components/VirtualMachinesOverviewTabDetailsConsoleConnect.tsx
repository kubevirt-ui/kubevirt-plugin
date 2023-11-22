import React from 'react';
import cn from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PlayIcon } from '@patternfly/react-icons';

type VirtualMachinesOverviewTabDetailsConsoleConnectProps = {
  connect?: () => void;
  isDisabled?: boolean;
  isHeadlessMode?: boolean;
};

const VirtualMachinesOverviewTabDetailsConsoleConnect: React.FC<
  VirtualMachinesOverviewTabDetailsConsoleConnectProps
> = ({ connect, isDisabled, isHeadlessMode }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className={cn('vnc-grey-background', isDisabled && 'disabled')}>
      {!isDisabled && <PlayIcon onClick={connect} size="md" />}
      {isHeadlessMode && t('Console is disabled in headless mode')}
    </div>
  );
};

export default VirtualMachinesOverviewTabDetailsConsoleConnect;
