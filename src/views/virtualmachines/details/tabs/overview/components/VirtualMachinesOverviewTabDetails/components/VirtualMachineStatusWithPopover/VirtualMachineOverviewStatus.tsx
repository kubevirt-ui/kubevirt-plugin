import type { FC, ReactNode } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import LightspeedCard from '@lightspeed/components/LightspeedCard';
import LightspeedHelpButton from '@lightspeed/components/LightspeedHelpButton/LightspeedHelpButton';
import { getOLSPrompt, OLSPromptType } from '@lightspeed/utils/prompts';
import { Content, Popover, PopoverPosition, Split, SplitItem } from '@patternfly/react-core';
import { isErrorPrintableStatus } from '@virtualmachines/utils';

import ViewDiagnosticLink from './ViewDiagnosticLink';

import './VirtualMachineOverviewStatus.scss';

type VirtualMachineOverviewStatusProps = {
  children?: ReactNode;
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
              <LightspeedCard prompt={getOLSPrompt(OLSPromptType.VM_STATUS_CONCISE, { vm })} />
            )}
            <br />
            <Split>
              <SplitItem>
                <ViewDiagnosticLink vm={vm} />
              </SplitItem>
              <SplitItem isFilled />
              <SplitItem>
                <LightspeedHelpButton
                  isTroubleshootContext={isErrorStatus}
                  obj={vm}
                  onClick={hide}
                  promptType={OLSPromptType.VM_STATUS}
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
