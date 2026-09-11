import type { FC } from 'react';
import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import ConnectToConsole from '../ConnectToConsole';

import type { CustomConnectComponentProps } from '../vnc-console/utils/VncConsoleTypes';

const SerialConnect: FC<CustomConnectComponentProps> = ({ connect, isConnecting }) => {
  const { t } = useKubevirtTranslation();
  return (
    <ConnectToConsole
      {...{
        connect,
        connectingMsg: t('Loading ...'),
        connectMsg: t('Connect'),
        isConnecting,
        message: t('Click Connect to open serial console.'),
      }}
    />
  );
};

export default SerialConnect;
