import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { Popover, PopoverPosition } from '@patternfly/react-core';

import StatusPopoverButton from '../StatusPopoverButton/StatusPopoverButton';

type VirtualMachineOverviewStatusProps = {
  vmPrintableStatus: string;
};

const VirtualMachineOverviewStatus: FC<VirtualMachineOverviewStatusProps> = ({
  vmPrintableStatus,
}) => {
  const { t } = useKubevirtTranslation();
  if (!vmPrintableStatus) return <>{NO_DATA_DASH}</>;

  return (
    <>
      <Popover
        headerContent={vmPrintableStatus}
        bodyContent={t('VirtualMachine is currently {{status}}', {
          status: vmPrintableStatus,
        })}
        position={PopoverPosition.right}
      >
        <StatusPopoverButton vmPrintableStatus={vmPrintableStatus} />
      </Popover>
    </>
  );
};

export default VirtualMachineOverviewStatus;
