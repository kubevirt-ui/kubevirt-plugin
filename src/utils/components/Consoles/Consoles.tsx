import React, { type FC, memo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getConsoleStandaloneURL } from '@multicluster/urls';
import { Button, ButtonVariant, Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

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
import { type ConsoleComponentState, type ConsoleType } from './components/utils/types';
import HideConsole from './components/vnc-console/HideConsole';
import SessionAlreadyInUseModal from './components/vnc-console/SessionAlreadyInUseModal';
import { isConnectableState } from './components/vnc-console/utils/util';
import VncConnect from './components/vnc-console/VncConnect';
import VncConsole from './components/vnc-console/VncConsole';
import { type ConsolesProps } from './ConsolesTypes';

import './consoles.scss';

const Consoles: FC<ConsolesProps> = ({
  consoleContainerClass,
  isHeadlessMode,
  isStandAlone = false,
  isWindowsVM,
  path,
  vmCluster,
  vmName,
  vmNamespace,
  vncLogLevel,
}) => {
  const { t } = useKubevirtTranslation();
  const [consoleState, setConsoleState] = useState<ConsoleComponentState>({
    actions: {},
    state: ConsoleState.Init,
    type: VNC_CONSOLE_TYPE,
  });
  const { actions, state, type } = consoleState;

  if (isHeadlessMode) {
    return <div>{t('Console is disabled in headless mode')}</div>;
  }

  const isConnected = state === ConsoleState.Connected;
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
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              flexWrap={{ default: 'wrap' }}
              spaceItems={{ default: 'spaceItemsMd' }}
            >
              {!isStandAlone && (
                <FlexItem>
                  <Button
                    icon={<ExternalLinkAltIcon />}
                    iconPosition="end"
                    onClick={() => {
                      actions?.disconnect?.();
                      window.open(getConsoleStandaloneURL(vmNamespace, vmName, vmCluster));
                    }}
                    variant={ButtonVariant.secondary}
                  >
                    {t('Open web console')}
                  </Button>
                </FlexItem>
              )}
              <FlexItem>
                <AccessConsoles
                  actions={actions}
                  isWindowsVM={isWindowsVM}
                  setType={(newType: ConsoleType) =>
                    setConsoleState({
                      actions: {},
                      state: ConsoleState.Disconnected,
                      type: newType,
                    })
                  }
                  state={state}
                  type={type}
                />
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </StackItem>
      <StackItem className={consoleContainerClass}>
        {type === VNC_CONSOLE_TYPE && showConnect && (
          <VncConnect connect={actions?.connect} isConnecting={state === ConsoleState.Connecting} />
        )}
        {type === VNC_CONSOLE_TYPE && (
          <HideConsole isHidden={!isConnected}>
            <VncConsole
              basePath={path}
              // force re-create on change
              key={`vnc-${path}-${vncLogLevel}`}
              setState={setConsoleState}
              vncLogLevel={vncLogLevel}
            />
          </HideConsole>
        )}
        {type === SERIAL_CONSOLE_TYPE && showConnect && (
          <SerialConnect
            connect={actions?.connect}
            isConnecting={state === ConsoleState.Connecting}
          />
        )}
        {type === SERIAL_CONSOLE_TYPE && (
          <HideConsole isHidden={!isConnected}>
            <SerialConsole basePath={path} setState={setConsoleState} />
          </HideConsole>
        )}
        {type === DESKTOP_VIEWER_CONSOLE_TYPE && (
          <DesktopViewer vmCluster={vmCluster} vmName={vmName} vmNamespace={vmNamespace} />
        )}
      </StackItem>
      <SessionAlreadyInUseModal
        connect={actions.connect}
        isOpen={type === VNC_CONSOLE_TYPE && state === ConsoleState.SessionAlreadyInUse}
        setConsoleState={(newState: ConsoleState) =>
          setConsoleState((prev) =>
            prev.type !== VNC_CONSOLE_TYPE ? prev : { ...prev, state: newState },
          )
        }
      />
    </Stack>
  );
};

export default memo(Consoles);
