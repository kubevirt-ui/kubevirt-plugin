import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { WSFactory } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/ws-factory';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted } from '../../utils/utils';
import { ConsoleState, WS, WSS } from '../utils/ConsoleConsts';

import { WebSocket } from './utils/serialConsole';
import SerialConsole from './SerialConsole';

const { connected, disconnected, loading } = ConsoleState;

type SerialConsoleConnectorProps = React.HTMLProps<HTMLDivElement> & {
  vmi: V1VirtualMachineInstance;
};

const SerialConsoleConnector: React.FC<SerialConsoleConnectorProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const [status, setStatus] = React.useState(loading);
  const terminalRef = React.useRef(null);
  const socket = React.useRef<WebSocket>(null);

  const onBackendDisconnected = React.useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.onConnectionClosed('Reason for disconnect provided by backend.');
    }

    socket?.current?.destroy();
    setStatus(disconnected); // will close the terminal window
  }, []);

  const setConnected = React.useCallback(() => {
    setStatus(connected);
  }, [setStatus]);

  const onDataFromBackend = React.useCallback((data) => {
    if (terminalRef.current) {
      const reader = new FileReader();
      reader.addEventListener('loadend', (e) => {
        // Blob to text transformation ...
        const target = (e.target || e.srcElement) as any;
        const text = target.result;
        terminalRef.current.onDataReceived(text);
      });
      reader.readAsText(data);
    }
  }, []);

  const onConnect = React.useCallback(() => {
    if (socket.current) {
      socket.current.destroy();
      setStatus(loading);
    }

    const websocketOptions = {
      host: `${isConnectionEncrypted() ? WSS : WS}://${window.location.hostname}:${
        window.location.port || (isConnectionEncrypted() ? SECURE : INSECURE)
      }`,
      jsonParse: false,
      path: `/api/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${vmi?.metadata?.namespace}/virtualmachineinstances/${vmi?.metadata?.name}/console`,
      reconnect: false,
      subprotocols: ['plain.kubevirt.io'],
    };

    socket.current = new WSFactory(`${vmi?.metadata?.name}-serial`, websocketOptions)
      .onmessage(onDataFromBackend)
      .onopen(setConnected)
      .onclose(onBackendDisconnected)
      .onerror((event) => {
        console.log('WebSocket error received: ', event);
      });
  }, [onDataFromBackend, setConnected, vmi, onBackendDisconnected]);

  const onData = React.useCallback((data) => {
    // data is resent back from backend so _will_ pass through onDataFromBackend
    socket?.current?.send(new Blob([data]));
  }, []);

  return (
    <SerialConsole
      fontFamily="monospace"
      fontSize={12}
      onConnect={onConnect}
      onData={onData}
      onDisconnect={onBackendDisconnected}
      ref={terminalRef}
      status={status}
      textConnect={t('Connect')}
      textDisconnect={t('Disconnect')}
      textDisconnected={t('Click Connect to open serial console.')}
      textLoading={t('Loading ...')}
      textReset={t('Reset')}
    />
  );
};

export default SerialConsoleConnector;
