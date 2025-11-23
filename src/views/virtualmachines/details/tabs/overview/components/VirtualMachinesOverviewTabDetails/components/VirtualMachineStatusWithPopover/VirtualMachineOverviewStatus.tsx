import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace, getVMStatus } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import LightspeedCard from '@lightspeed/components/LightspeedCard';
import LightspeedHelpButton from '@lightspeed/components/LightspeedHelpButton';
import { getCluster } from '@multicluster/helpers/selectors';
import { getVMURL } from '@multicluster/urls';
import { Content, Popover, PopoverPosition, Split, SplitItem } from '@patternfly/react-core';
import { isErrorPrintableStatus } from '@virtualmachines/utils';

import './VirtualMachineOverviewStatus.scss';

type VirtualMachineOverviewStatusProps = {
  vm: V1VirtualMachine;
};

const VirtualMachineOverviewStatus: FC<VirtualMachineOverviewStatusProps> = ({ children, vm }) => {
  const { t } = useKubevirtTranslation();
  const vmPrintableStatus = getVMStatus(vm);
  const isErrorStatus = isErrorPrintableStatus(vmPrintableStatus);

  if (!vmPrintableStatus) return <>{NO_DATA_DASH}</>;

  return (
    <>
      <Popover
        bodyContent={(hide) => (
          <div className="vm-overview-status">
            <Content component="p">
              {t('VirtualMachine is currently {{ status }}', {
                status: vmPrintableStatus,
              })}
            </Content>
            {isErrorStatus && (
              <LightspeedCard
                prompt={`Provide a very concise explanation for why a VirtualMachine would have a status of ${vmPrintableStatus}. Don't provide troubleshooting steps and don't add phrases indicating that this response is intended to brief.`}
              />
            )}
            <br />
            <Split>
              <SplitItem>
                <Content component="p">
                  <Link
                    to={`${getVMURL(getCluster(vm), getNamespace(vm), getName(vm))}/diagnostics`}
                  >
                    {t('View diagnostic')}
                  </Link>
                </Content>
              </SplitItem>
              <SplitItem isFilled />
              <SplitItem>
                <LightspeedHelpButton
                  prompt={
                    isErrorStatus
                      ? `Provide a detailed explanation for why a VirtualMachine would have a status of ${vmPrintableStatus} and provide troubleshooting steps for how to fix it.`
                      : `Provide a detailed explanation for why a VirtualMachine would have a status of ${vmPrintableStatus}.`
                  }
                  isTroubleshootContext={isErrorStatus}
                  onClick={hide}
                />
              </SplitItem>
            </Split>
          </div>
        )}
        className="vm-overview-status-popover"
        headerContent={vmPrintableStatus}
        position={PopoverPosition.right}
      >
        <>{children}</>
      </Popover>
    </>
  );
};

export default VirtualMachineOverviewStatus;
