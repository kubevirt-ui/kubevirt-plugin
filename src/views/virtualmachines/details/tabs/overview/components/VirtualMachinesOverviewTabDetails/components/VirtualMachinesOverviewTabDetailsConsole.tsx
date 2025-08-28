import React, { FC, memo, useState } from 'react';

import {
  ConsoleState,
  VNC_CONSOLE_TYPE,
} from '@kubevirt-utils/components/Consoles/components/utils/ConsoleConsts';
import { ConsoleComponentState } from '@kubevirt-utils/components/Consoles/components/utils/types';
import HideConsole from '@kubevirt-utils/components/Consoles/components/vnc-console/HideConsole';
import VncConsole from '@kubevirt-utils/components/Consoles/components/vnc-console/VncConsole';
import { getConsoleBasePath } from '@kubevirt-utils/components/Consoles/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useK8sBaseAPIPath from '@multicluster/hooks/useK8sBaseAPIPath';
import { getConsoleStandaloneURL } from '@multicluster/urls';
import { Bullseye, Button, ButtonVariant, Spinner } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import VirtualMachinesOverviewTabDetailsConsoleConnect from './VirtualMachinesOverviewTabDetailsConsoleConnect';

type VirtualMachinesOverviewTabDetailsConsoleProps = {
  canConnectConsole: boolean;
  isHeadlessMode: boolean;
  isVMRunning: boolean;
  vmCluster?: string;
  vmName: string;
  vmNamespace: string;
};

const VirtualMachinesOverviewTabDetailsConsole: FC<
  VirtualMachinesOverviewTabDetailsConsoleProps
> = ({ canConnectConsole, isHeadlessMode, isVMRunning, vmCluster, vmName, vmNamespace }) => {
  const { t } = useKubevirtTranslation();
  const [apiPath, apiPathLoaded] = useK8sBaseAPIPath(vmCluster);
  const [{ actions, state }, setState] = useState<ConsoleComponentState>({
    actions: {},
    state: ConsoleState.init,
    type: VNC_CONSOLE_TYPE,
  });
  const enableConsole = isVMRunning && !isHeadlessMode && canConnectConsole;
  const showConnect =
    !enableConsole || // connect component is also empty state here
    state === ConsoleState.disconnected ||
    state === ConsoleState.connecting;

  if (!apiPathLoaded)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );

  return (
    <Bullseye className="console-overview">
      <div className="link">
        <Button
          icon={<ExternalLinkAltIcon className="icon" />}
          iconPosition="end"
          isDisabled={!enableConsole}
          onClick={() => window.open(getConsoleStandaloneURL(vmNamespace, vmName, vmCluster))}
          variant={ButtonVariant.link}
        >
          {t('Open web console')}
        </Button>
      </div>
      {enableConsole && (
        <HideConsole isHidden={state !== ConsoleState.connected}>
          <VncConsole
            basePath={getConsoleBasePath({ apiPath, name: vmName, namespace: vmNamespace })}
            setState={setState}
            viewOnly
          />
        </HideConsole>
      )}
      {showConnect && (
        <div className="console-vnc">
          <VirtualMachinesOverviewTabDetailsConsoleConnect
            connect={actions?.connect}
            isConnecting={state === ConsoleState.connecting}
            isDisabled={!enableConsole}
            isHeadlessMode={isHeadlessMode}
          />
        </div>
      )}
    </Bullseye>
  );
};

export default memo(VirtualMachinesOverviewTabDetailsConsole);
