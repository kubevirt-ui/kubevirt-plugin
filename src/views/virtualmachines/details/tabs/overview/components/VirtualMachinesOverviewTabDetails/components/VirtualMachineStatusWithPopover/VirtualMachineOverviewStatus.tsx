import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl, getVMStatus } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { Content, Popover, PopoverPosition } from '@patternfly/react-core';

type VirtualMachineOverviewStatusProps = {
  vm: V1VirtualMachine;
};

const VirtualMachineOverviewStatus: FC<VirtualMachineOverviewStatusProps> = ({ children, vm }) => {
  const { t } = useKubevirtTranslation();
  const vmPrintableStatus = getVMStatus(vm);

  if (!vmPrintableStatus) return <>{NO_DATA_DASH}</>;

  return (
    <>
      <Popover
        bodyContent={
          <>
            <Content component="p">
              {t('VirtualMachine is currently {{ status }}', {
                status: vmPrintableStatus,
              })}
            </Content>
            <br />
            <Content component="p">
              <Link
                to={`${getResourceUrl({ model: VirtualMachineModel, resource: vm })}/diagnostics`}
              >
                {t('View diagnostic')}
              </Link>
            </Content>
          </>
        }
        headerContent={vmPrintableStatus}
        position={PopoverPosition.right}
      >
        <>{children}</>
      </Popover>
    </>
  );
};

export default VirtualMachineOverviewStatus;
