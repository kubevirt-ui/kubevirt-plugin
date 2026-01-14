import React, { FC, memo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';

import { AccessConsoles } from './components/AccessConsoles/AccessConsoles';
import CloudInitCredentials from './components/CloudInitCredentials/CloudInitCredentials';
import DesktopViewer from './components/DesktopViewer/DesktopViewer';
import SerialConnect from './components/SerialConsole/SerialConnect';
import SerialConsole from './components/SerialConsole/SerialConsole';
import {
  ConsoleState,
  DESKTOP_VIEWER_CONSOLE_TYPE,
  SERIAL_CONSOLE_TYPE,
  VNC_CONSOLE_TYPE,
} from './components/utils/ConsoleConsts';
import { ConsoleComponentState, ConsoleType } from './components/utils/types';
import HideConsole from './components/vnc-console/HideConsole';
import SessionAlreadyInUseModal from './components/vnc-console/SessionAlreadyInUseModal';
import { isConnectableState } from './components/vnc-console/utils/util';
import { VncLogLevel } from './components/vnc-console/utils/VncConsoleTypes';
import VncConnect from './components/vnc-console/VncConnect';
import VncConsole from './components/vnc-console/VncConsole';

import './consoles.scss';

type ConsolesProps = {
  consoleContainerClass?: string;
  isHeadlessMode: boolean;
  isStandAlone?: boolean;
  isVmRunning?: boolean;
  isWindowsVM: boolean;
  path: string;
  vmCluster?: string;
  vmName: string;
  vmNamespace: string;
  vncLogLevel?: VncLogLevel;
};

const Consoles: FC<ConsolesProps> = ({
  consoleContainerClass,
  isHeadlessMode,
  isWindowsVM,
  path,
  vmCluster,
  vmName,
  vmNamespace,
  vncLogLevel,
}) => {
  const { t } = useKubevirtTranslation();
  const [{ actions, state, type }, setState] = useState<ConsoleComponentState>({
    actions: {},
    state: ConsoleState.init,
    type: VNC_CONSOLE_TYPE,
  });

  if (isHeadlessMode) {
    return <div>{t('Console is disabled in headless mode')}</div>;
  }

  const isConnected = state === ConsoleState.connected;
  const showConnect = isConnectableState(state);

  return (
    <Stack>
      <StackItem className="consoles-actions">
        <Flex className="consoles-actions-inner-flex">
          <FlexItem>
            {!isWindowsVM && (
              <CloudInitCredentials
                vmCluster={vmCluster}
                vmName={vmName}
                vmNamespace={vmNamespace}
              />
            )}
          </FlexItem>
          <FlexItem>
            <AccessConsoles
              setType={(newType: ConsoleType) =>
                setState({ actions: {}, state: ConsoleState.disconnected, type: newType })
              }
              actions={actions}
              isWindowsVM={isWindowsVM}
              state={state}
              type={type}
            />
          </FlexItem>
        </Flex>
      </StackItem>
      <StackItem className={consoleContainerClass}>
        {type === VNC_CONSOLE_TYPE && showConnect && (
          <VncConnect connect={actions?.connect} isConnecting={state === ConsoleState.connecting} />
        )}
        {type === VNC_CONSOLE_TYPE && (
          <HideConsole isHidden={!isConnected}>
            <VncConsole basePath={path} setState={setState} vncLogLevel={vncLogLevel} />
          </HideConsole>
        )}
        {type === SERIAL_CONSOLE_TYPE && showConnect && (
          <SerialConnect
            connect={actions?.connect}
            isConnecting={state === ConsoleState.connecting}
          />
        )}
        {type === SERIAL_CONSOLE_TYPE && (
          <HideConsole isHidden={!isConnected}>
            <SerialConsole basePath={path} setState={setState} />
          </HideConsole>
        )}
        {type === DESKTOP_VIEWER_CONSOLE_TYPE && (
          <DesktopViewer vmCluster={vmCluster} vmName={vmName} vmNamespace={vmNamespace} />
        )}
      </StackItem>
      <SessionAlreadyInUseModal
        setConsoleState={(consoleState: ConsoleState) =>
          setState((prev) =>
            prev.type !== VNC_CONSOLE_TYPE ? prev : { ...prev, state: consoleState },
          )
        }
        connect={actions.connect}
        isOpen={type === VNC_CONSOLE_TYPE && state === ConsoleState.session_already_in_use}
      />
    </Stack>
  );
};

export default memo(Consoles);
