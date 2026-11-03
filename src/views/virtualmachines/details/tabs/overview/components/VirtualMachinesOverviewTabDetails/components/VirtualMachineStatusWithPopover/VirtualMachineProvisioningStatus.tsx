import type { FC, ReactNode } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { Content, Popover, PopoverPosition, Progress, ProgressSize } from '@patternfly/react-core';

import useProvisioningPercentage from '../../../../../../../../../utils/resources/vm/hooks/useProvisioningPercentage';
import ViewDiagnosticLink from './ViewDiagnosticLink';

import './virtualmachine-provisioning-status.scss';

type VirtualMachineProvisioningStatusProps = {
  children?: ReactNode;
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
          <ViewDiagnosticLink vm={vm} />
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
