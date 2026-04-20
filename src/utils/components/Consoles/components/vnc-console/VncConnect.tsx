import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import ConnectToConsole from '../ConnectToConsole';

import { CustomConnectComponentProps } from './utils/VncConsoleTypes';

const VncConnect: FCC<CustomConnectComponentProps> = ({ connect, isConnecting }) => {
  const { t } = useKubevirtTranslation();
  return (
    <ConnectToConsole
      {...{
        connect,
        connectingMsg: t('Connecting'),
        connectMsg: t('Connect'),
        isConnecting,
        message: t('Click Connect to open the VNC console.'),
      }}
    />
  );
};

export default VncConnect;
