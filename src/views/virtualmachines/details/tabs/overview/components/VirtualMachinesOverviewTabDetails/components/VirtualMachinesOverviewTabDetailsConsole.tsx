import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VNC_CONSOLE_TYPE } from '@kubevirt-utils/components/Consoles/components/utils/ConsoleConsts';
import VncConsole from '@kubevirt-utils/components/Consoles/components/vnc-console/VncConsole';
import { INSECURE, SECURE } from '@kubevirt-utils/components/Consoles/utils/constants';
import {
  isConnectionEncrypted,
  isHeadlessModeVMI,
} from '@kubevirt-utils/components/Consoles/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vmiStatuses } from '@kubevirt-utils/resources/vmi';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
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
  const isHeadlessMode = isHeadlessModeVMI(vmi);
  const isVMRunning = vmi?.status?.phase === vmiStatuses.Running;
  const [canConnectConsole] = useAccessReview({
    group: 'subresources.kubevirt.io',
    name: vmi?.metadata?.name,
    namespace: vmi?.metadata?.namespace,
    resource: 'virtualmachineinstances/vnc',
    verb: 'get',
  });
  return (
    <Bullseye className="bullseye">
      {isVMRunning && !isHeadlessMode && canConnectConsole ? (
        <>
          <VncConsole
            CustomConnectComponent={VirtualMachinesOverviewTabDetailsConsoleConnect}
            encrypt={isEncrypted}
            host={window.location.hostname}
            path={`api/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${vmi?.metadata?.namespace}/virtualmachineinstances/${vmi?.metadata?.name}/vnc`}
            port={window.location.port || (isEncrypted ? SECURE : INSECURE)}
            scaleViewport
            showAccessControls={false}
            type={VNC_CONSOLE_TYPE}
          />
        </>
      ) : (
        <div className="pf-c-console__vnc">
          <VirtualMachinesOverviewTabDetailsConsoleConnect
            isDisabled
            isHeadlessMode={isHeadlessMode}
          />
        </div>
      )}
      <div className="link">
        <Button
          onClick={() =>
            window.open(
              `/k8s/ns/${vmi?.metadata?.namespace}/kubevirt.io~v1~VirtualMachine/${vmi?.metadata?.name}/console/standalone`,
            )
          }
          isDisabled={!isVMRunning || isHeadlessMode || !canConnectConsole}
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
