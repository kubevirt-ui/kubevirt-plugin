import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl, getVMStatus } from '@kubevirt-utils/resources/shared';
import { Content, Popover, PopoverPosition, Progress, ProgressSize } from '@patternfly/react-core';

import useProvisioningPercentage from '../../../../../../../../../utils/resources/vm/hooks/useProvisioningPercentage';

import './virtualmachine-provisioning-status.scss';

type VirtualMachineProvisioningStatusProps = {
  vm: V1VirtualMachine;
};

const VirtualMachineProvisioningStatus: FC<VirtualMachineProvisioningStatusProps> = ({
  children,
  vm,
}) => {
  const vmPrintableStatus = getVMStatus(vm);

  const { t } = useKubevirtTranslation();
  const { percentages } = useProvisioningPercentage(vm);

  const numberOfProvisioningDisks = Object.keys(percentages).length;

  return (
    <Popover
      bodyContent={
        <>
          <Content component="p">{t('VirtualMachine is currently provisioning')}</Content>
          <br />

          {Object.keys(percentages).map((diskName) => (
            <Progress
              className="progress"
              key={diskName}
              size={ProgressSize.lg}
              title={numberOfProvisioningDisks > 1 ? diskName : t('Copying files')}
              value={parseFloat(percentages[diskName])}
            />
          ))}
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
      className="virtualmachine-privisioning-status"
      headerContent={vmPrintableStatus}
      position={PopoverPosition.right}
    >
      <>{children}</>
    </Popover>
  );
};

export default VirtualMachineProvisioningStatus;
