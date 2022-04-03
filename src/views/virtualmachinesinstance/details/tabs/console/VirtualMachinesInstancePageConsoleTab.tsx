import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye } from '@patternfly/react-core';

import { AccessConsoles } from './components/AccessConsoles/AccessConsoles';
import SerialConsoleConnector from './components/SerialConsole/SerialConsoleConnector';
import { SERIAL_CONSOLE_TYPE, VNC_CONSOLE_TYPE } from './components/utils/ConsoleConsts';
import VncConsole from './components/vnc-console/VncConsole';
import { INSECURE, SECURE } from './utils/VirtualMachinesInstancePageConsoleTabConsts';
import { isConnectionEncrypted } from './utils/VirtualMachinesInstancePageConsoleTabUtils';

const VirtualMachinesInstancePageConsoleTab: React.FC<
  VirtualMachinesInstancePageConsoleTabProps
> = ({ obj: vmi }) => {
  const isEncrypted = isConnectionEncrypted();
  const { t } = useKubevirtTranslation();

  return !vmi?.metadata ? (
    <Bullseye>
      <Loading />
    </Bullseye>
  ) : (
    <>
      <AccessConsoles
        preselectedType={VNC_CONSOLE_TYPE}
        textSelectConsoleType={t('Select console type')}
        textSerialConsole={t('Serial console')}
        textVncConsole={t('VNC console')}
        textDesktopViewerConsole={t('Desktop viewer')}
      >
        <VncConsole
          type={VNC_CONSOLE_TYPE}
          encrypt={isEncrypted}
          host={window.location.hostname}
          port={window.location.port || (isEncrypted ? SECURE : INSECURE)}
          path={`api/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${vmi?.metadata?.namespace}/virtualmachineinstances/${vmi?.metadata?.name}/vnc`}
        />
        <SerialConsoleConnector vmi={vmi} type={SERIAL_CONSOLE_TYPE} />
      </AccessConsoles>
    </>
  );
};

type VirtualMachinesInstancePageConsoleTabProps = RouteComponentProps & {
  obj: V1VirtualMachineInstance;
};

export default VirtualMachinesInstancePageConsoleTab;
