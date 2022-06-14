import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VNC_CONSOLE_TYPE } from '@kubevirt-utils/components/Consoles/components/utils/ConsoleConsts';
import VncConsole from '@kubevirt-utils/components/Consoles/components/vnc-console/VncConsole';
import { INSECURE, SECURE } from '@kubevirt-utils/components/Consoles/utils/constants';
import { isConnectionEncrypted } from '@kubevirt-utils/components/Consoles/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vmiStatuses } from '@kubevirt-utils/resources/vmi';
import { Bullseye, Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import VirtualMachinesOverviewTabDetailsConsoleConnect from './VirtualMachinesOverviewTabDetailsConsoleConnect';

type VirtualMachinesOverviewTabDetailsConsoleProps = {
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabDetailsConsole: React.FC<
  VirtualMachinesOverviewTabDetailsConsoleProps
> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const isEncrypted = isConnectionEncrypted();
  const isVMRunning = vmi?.status?.phase === vmiStatuses.Running;

  return (
    <Bullseye className="bullseye">
      {isVMRunning ? (
        <>
          <VncConsole
            type={VNC_CONSOLE_TYPE}
            encrypt={isEncrypted}
            host={window.location.hostname}
            port={window.location.port || (isEncrypted ? SECURE : INSECURE)}
            path={`api/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${vmi?.metadata?.namespace}/virtualmachineinstances/${vmi?.metadata?.name}/vnc`}
            scaleViewport
            showAccessControls={false}
            CustomConnectComponent={VirtualMachinesOverviewTabDetailsConsoleConnect}
          />
        </>
      ) : (
        <div className="pf-c-console__vnc">
          <VirtualMachinesOverviewTabDetailsConsoleConnect isDisabled />
        </div>
      )}
      <div className="link">
        <Button
          isDisabled={!isVMRunning}
          onClick={() =>
            window.open(
              `/k8s/ns/${vmi?.metadata?.namespace}/kubevirt.io~v1~VirtualMachine/${vmi?.metadata?.name}/console/standalone`,
            )
          }
          variant="link"
        >
          {t('Open web console')}
          <ExternalLinkAltIcon className="icon" />
        </Button>
      </div>
    </Bullseye>
  );
};

export default VirtualMachinesOverviewTabDetailsConsole;
