import React, {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { WSFactory } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/ws-factory';
import { Button, EmptyState, EmptyStateBody, EmptyStateFooter } from '@patternfly/react-core';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted } from '../../utils/utils';
import { ConsoleState, WS, WSFactoryExtends, WSS } from '../utils/ConsoleConsts';
import useCopyPasteConsole from '../utils/hooks/useCopyPasteConsole';

import { WebSocket } from './utils/serialConsole';
import { XTerm } from './Xterm/Xterm';

const { destroyed, init, open } = ConsoleState;

type SerialConsoleConnectorProps = {
  onConnect?: Dispatch<SetStateAction<WebSocket>>;
  vmi: V1VirtualMachineInstance;
};

const SerialConsoleConnector: FC<SerialConsoleConnectorProps> = ({ onConnect, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [status, setStatus] = useState(init);
  const pasteText = useCopyPasteConsole();

  const terminalRef = useRef(null);
  const [socket, setSocket] = useState<WebSocket>(null);

  const connect = useCallback(() => {
    if (socket) {
      socket.destroy();
      setStatus(init);
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

    const createdSocket = new WSFactory(`${vmi?.metadata?.name}-serial`, websocketOptions)
      .onmessage((data: Blob) => {
        data.text().then((text) => {
          terminalRef.current.onDataReceived(text);
        });
      })
      .onopen(() => {
        setStatus(open);
      })
      .onclose(function () {
        this?.destroy();
        setStatus(destroyed);
      })
      .ondestroy(() => setStatus(destroyed))
      .onerror((event) => {
        kubevirtConsole.log('WebSocket error received: ', event);
      }) as WSFactoryExtends;
    createdSocket.onPaste = async function () {
      try {
        const text = await navigator.clipboard.readText();
        this?.send(new Blob([text]));
      } catch {
        this?.send(new Blob([pasteText?.current]));
      }
    };
    setSocket(createdSocket);
    onConnect?.(createdSocket);
  }, [socket, vmi?.metadata?.namespace, vmi?.metadata?.name, onConnect, pasteText]);

  useEffect(() => {
    !socket && connect();
  }, [connect, socket]);

  return (
    <>
      {status === open && (
        <XTerm
          onData={(data) => {
            socket?.send(new Blob([data]));
          }}
          fontFamily={'monospace'}
          fontSize={12}
          innerRef={terminalRef}
        />
      )}
      {status === destroyed && (
        <EmptyState>
          <EmptyStateBody>{t('Click Connect to open serial console.')}</EmptyStateBody>
          <EmptyStateFooter>
            <Button onClick={connect}>{t('Connect')}</Button>
          </EmptyStateFooter>
        </EmptyState>
      )}
      {status === init && <LoadingEmptyState bodyContents={t('Loading ...')} />}
    </>
  );
};

export default SerialConsoleConnector;
