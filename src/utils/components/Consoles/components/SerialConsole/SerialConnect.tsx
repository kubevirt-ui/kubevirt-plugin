import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import ConnectToConsole from '../ConnectToConsole';
import { CustomConnectComponentProps } from '../vnc-console/utils/VncConsoleTypes';

const SerialConnect: FCC<CustomConnectComponentProps> = ({ connect, isConnecting }) => {
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
