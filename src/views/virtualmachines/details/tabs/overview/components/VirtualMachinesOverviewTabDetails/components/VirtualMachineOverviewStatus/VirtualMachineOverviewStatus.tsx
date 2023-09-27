import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { Popover, PopoverPosition, Text } from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

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
        bodyContent={
          <>
            <Text>
              {t('VirtualMachine is currently {{ status }}', {
                status: vmPrintableStatus,
              })}
            </Text>
            <br />
            <Text>
              <Link to={(location) => createURL('diagnostics', location?.pathname)}>
                {t('View diagnostic')}
              </Link>
            </Text>
          </>
        }
        headerContent={vmPrintableStatus}
        position={PopoverPosition.right}
      >
        <StatusPopoverButton vmPrintableStatus={vmPrintableStatus} />
      </Popover>
    </>
  );
};

export default VirtualMachineOverviewStatus;
