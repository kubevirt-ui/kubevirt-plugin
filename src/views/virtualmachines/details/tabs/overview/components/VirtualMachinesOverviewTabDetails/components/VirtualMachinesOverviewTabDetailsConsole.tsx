import React, { FC, memo, useState } from 'react';

import {
  ConsoleState,
  VNC_CONSOLE_TYPE,
} from '@kubevirt-utils/components/Consoles/components/utils/ConsoleConsts';
import { ConsoleComponentState } from '@kubevirt-utils/components/Consoles/components/utils/types';
import HideConsole from '@kubevirt-utils/components/Consoles/components/vnc-console/HideConsole';
import { isConnectableState } from '@kubevirt-utils/components/Consoles/components/vnc-console/utils/util';
import { VncLogLevel } from '@kubevirt-utils/components/Consoles/components/vnc-console/utils/VncConsoleTypes';
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
  vncAutoconnect?: boolean;
  vncLogLevel?: VncLogLevel;
};

const VirtualMachinesOverviewTabDetailsConsole: FC<
  VirtualMachinesOverviewTabDetailsConsoleProps
> = ({
  canConnectConsole,
  isHeadlessMode,
  isVMRunning,
  vmCluster,
  vmName,
  vmNamespace,
  vncAutoconnect = true,
  vncLogLevel,
}) => {
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
    isConnectableState(state);

  if (!apiPathLoaded)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );

  const vncBasePath = getConsoleBasePath({ apiPath, name: vmName, namespace: vmNamespace });
  return (
    <Bullseye className="console-overview">
      <div className="link">
        <Button
          onClick={(e) => {
            e.preventDefault();
            actions?.disconnect?.();
            window.open(getConsoleStandaloneURL(vmNamespace, vmName, vmCluster));
          }}
          component="a"
          href={getConsoleStandaloneURL(vmNamespace, vmName, vmCluster)}
          icon={<ExternalLinkAltIcon className="icon" />}
          iconPosition="end"
          isDisabled={!enableConsole}
          variant={ButtonVariant.link}
        >
          {t('Open web console')}
        </Button>
      </div>
      {enableConsole && (
        <HideConsole isHidden={state !== ConsoleState.connected}>
          <VncConsole
            basePath={vncBasePath}
            // force re-create on change
            key={`vnc-${vncBasePath}-${vncLogLevel}-${vncAutoconnect}`}
            setState={setState}
            viewOnly
            vncAutoconnect={vncAutoconnect}
            vncLogLevel={vncLogLevel}
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
            isSessionAlreadyInUse={state === ConsoleState.session_already_in_use}
          />
        </div>
      )}
    </Bullseye>
  );
};

export default memo(VirtualMachinesOverviewTabDetailsConsole);
