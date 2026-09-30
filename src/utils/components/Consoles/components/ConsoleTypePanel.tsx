import { type FC, type ReactNode } from 'react';

import ConsoleForbiddenState from './ConsoleForbiddenState';
import { ConsoleState } from './utils/ConsoleConsts';
import HideConsole from './vnc-console/HideConsole';
import { isConnectableState } from './vnc-console/utils/util';
import { type CustomConnectComponentProps } from './vnc-console/utils/VncConsoleTypes';

type ConsoleTypePanelProps = {
  canConnect: boolean;
  children: ReactNode;
  connectComponent: FC<CustomConnectComponentProps>;
  isActive: boolean;
  onConnect?: () => void;
  state: ConsoleState;
};

const ConsoleTypePanel: FC<ConsoleTypePanelProps> = ({
  canConnect,
  children,
  connectComponent,
  isActive,
  onConnect,
  state,
}) => {
  if (!isActive) return null;

  const isForbidden = !canConnect || state === ConsoleState.Forbidden;
  if (isForbidden) return <ConsoleForbiddenState />;

  const ConnectComponent = connectComponent;

  return (
    <>
      {isConnectableState(state) && (
        <ConnectComponent connect={onConnect} isConnecting={state === ConsoleState.Connecting} />
      )}
      <HideConsole isHidden={state !== ConsoleState.Connected}>{children}</HideConsole>
    </>
  );
};

export default ConsoleTypePanel;
