import React, { type FC, memo, useState } from 'react';

import {
  ConsoleState,
  VNC_CONSOLE_TYPE,
} from '@kubevirt-utils/components/Consoles/components/utils/ConsoleConsts';
import { type ConsoleComponentState } from '@kubevirt-utils/components/Consoles/components/utils/types';
import HideConsole from '@kubevirt-utils/components/Consoles/components/vnc-console/HideConsole';
import { isConnectableState } from '@kubevirt-utils/components/Consoles/components/vnc-console/utils/util';
import { type VncLogLevel } from '@kubevirt-utils/components/Consoles/components/vnc-console/utils/VncConsoleTypes';
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
  vncLogLevel,
}) => {
  const { t } = useKubevirtTranslation();
  const [apiPath, apiPathLoaded] = useK8sBaseAPIPath(vmCluster);
  const [consoleState, setConsoleState] = useState<ConsoleComponentState>({
    actions: {},
    state: ConsoleState.Init,
    type: VNC_CONSOLE_TYPE,
  });
  const { actions, state } = consoleState;
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
          component="a"
          href={getConsoleStandaloneURL(vmNamespace, vmName, vmCluster)}
          icon={<ExternalLinkAltIcon className="icon" />}
          iconPosition="end"
          isDisabled={!enableConsole}
          onClick={(e) => {
            e.preventDefault();
            actions?.disconnect?.();
            window.open(
              getConsoleStandaloneURL(vmNamespace, vmName, vmCluster),
              '_blank',
              'noopener',
            );
          }}
          variant={ButtonVariant.link}
        >
          {t('Open web console')}
        </Button>
      </div>
      {enableConsole && (
        <HideConsole isHidden={state !== ConsoleState.Connected}>
          <VncConsole
            basePath={vncBasePath}
            // force re-create on change
            key={`vnc-${vncBasePath}-${vncLogLevel}`}
            setState={setConsoleState}
            viewOnly
            vncLogLevel={vncLogLevel}
          />
        </HideConsole>
      )}
      {showConnect && (
        <div className="console-vnc">
          <VirtualMachinesOverviewTabDetailsConsoleConnect
            connect={actions?.connect}
            isConnecting={state === ConsoleState.Connecting}
            isDisabled={!enableConsole}
            isHeadlessMode={isHeadlessMode}
            isSessionAlreadyInUse={state === ConsoleState.SessionAlreadyInUse}
          />
        </div>
      )}
    </Bullseye>
  );
};

export default memo(VirtualMachinesOverviewTabDetailsConsole);
