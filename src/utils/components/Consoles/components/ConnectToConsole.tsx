import type { FC } from 'react';

import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { Button, EmptyState, EmptyStateBody, EmptyStateFooter } from '@patternfly/react-core';

import type { CustomConnectComponentProps } from './vnc-console/utils/VncConsoleTypes';

type ConnectToConsoleProps = CustomConnectComponentProps & {
  connectingMsg: string;
  connectMsg: string;
  message: string;
};

const ConnectToConsole: FC<ConnectToConsoleProps> = ({
  connect,
  connectingMsg,
  connectMsg,
  isConnecting,
  message,
}) => {
  return (
    <>
      {!isConnecting && (
        <EmptyState>
          <EmptyStateBody>{message}</EmptyStateBody>
          <EmptyStateFooter>
            <Button onClick={connect}>{connectMsg}</Button>
          </EmptyStateFooter>
        </EmptyState>
      )}
      {isConnecting && <LoadingEmptyState bodyContents={connectingMsg} />}
    </>
  );
};

export default ConnectToConsole;
