import React, { FC, memo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';

import { AccessConsoles } from './components/AccessConsoles/AccessConsoles';
import { AccessConsolesActions } from './components/AccessConsoles/utils/accessConsoles';
import SerialConnect from './components/SerialConsole/SerialConnect';
import StableSerialConsole from './components/SerialConsole/StableSerialConsole';
import {
  ConsoleState,
  ConsoleType,
  DESKTOP_VIEWER_CONSOLE_TYPE,
  SERIAL_CONSOLE_TYPE,
  VNC_CONSOLE_TYPE,
} from './components/utils/ConsoleConsts';
import StableVncConsole from './components/vnc-console/StableVncConsole';
import VncConnect from './components/vnc-console/VncConnect';

import './consoles.scss';

type ConsolesProps = {
  consoleContainerClass?: string;
  hasGPU?: boolean;
  isHeadlessMode: boolean;
  isStandAlone?: boolean;
  isVmRunning?: boolean;
  isWindowsVM: boolean;
  path: string;
};

const StableConsole: FC<ConsolesProps> = ({
  consoleContainerClass,
  isHeadlessMode,
  isWindowsVM,
  path,
}) => {
  const { t } = useKubevirtTranslation();
  const [type, setType] = useState<ConsoleType>(VNC_CONSOLE_TYPE);
  const [actions, setActions] = useState<AccessConsolesActions>({});
  const [state, setState] = useState<ConsoleState>(ConsoleState.init);

  if (isHeadlessMode) {
    return <div>{t('Console is disabled in headless mode')}</div>;
  }

  const isConnected = state === ConsoleState.connected;
  const showConnect = state === ConsoleState.disconnected || state === ConsoleState.connecting;
  // eslint-disable-next-line no-console
  console.log('Foo:Console:', state, actions, `|${type}|`);
  return (
    <Stack>
      <StackItem className="consoles-actions">
        <Flex className="consoles-actions-inner-flex">
          <FlexItem>{/*TODO user/pass*/}</FlexItem>
          <FlexItem>
            <AccessConsoles
              actions={actions}
              isWindowsVM={isWindowsVM}
              setType={setType}
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
          <div className="console-container" style={!isConnected ? { display: 'none' } : {}}>
            <StableVncConsole basePath={path} setActions={setActions} setState={setState} />
          </div>
        )}
        {type === SERIAL_CONSOLE_TYPE && showConnect && (
          <SerialConnect
            connect={actions?.connect}
            isConnecting={state === ConsoleState.connecting}
          />
        )}
        {type === SERIAL_CONSOLE_TYPE && (
          <div className="console-container" style={!isConnected ? { display: 'none' } : {}}>
            <StableSerialConsole basePath={path} setActions={setActions} setState={setState} />
          </div>
        )}
        {type === DESKTOP_VIEWER_CONSOLE_TYPE && <>{/** TODO DesktopViewer */}</>}
      </StackItem>
    </Stack>
  );
};

export default memo(StableConsole);
