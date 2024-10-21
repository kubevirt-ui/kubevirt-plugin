import React, { FC, useState } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices } from '@kubevirt-utils/resources/vm';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Stack, StackItem } from '@patternfly/react-core';

import { AccessConsoles } from './components/AccessConsoles/AccessConsoles';
import CloudInitCredentials from './components/CloudInitCredentials/CloudInitCredentials';
import DesktopViewer from './components/DesktopViewer/DesktopViewer';
import SerialConsoleConnector from './components/SerialConsole/SerialConsoleConnector';
import {
  DESKTOP_VIEWER_CONSOLE_TYPE,
  SERIAL_CONSOLE_TYPE,
  VNC_CONSOLE_TYPE,
} from './components/utils/ConsoleConsts';
import VncConsole from './components/vnc-console/VncConsole';
import { isHeadlessModeVMI } from './utils/utils';

type ConsolesProps = {
  isStandAlone?: boolean;
  vmi: V1VirtualMachineInstance;
};

const Consoles: FC<ConsolesProps> = ({ isStandAlone, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [type, setType] = useState<null | string>(VNC_CONSOLE_TYPE);
  const [vm] = useK8sWatchResource<V1VirtualMachine>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    name: vmi?.metadata?.name,
    namespace: vmi?.metadata?.namespace,
  });
  const isWindowsVM = isWindows(vmi);
  const gpus = getGPUDevices(vm);
  const isHeadlessMode = isHeadlessModeVMI(vmi);

  if (!vmi?.metadata) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  return (
    <Stack hasGutter>
      <StackItem>
        {!isWindowsVM && <CloudInitCredentials isStandAlone={isStandAlone} vm={vm} />}
      </StackItem>
      <StackItem>
        <AccessConsoles isWindowsVM={isWindowsVM} setType={setType} type={type} />
      </StackItem>
      <StackItem>
        {type === VNC_CONSOLE_TYPE && (
          <VncConsole
            CustomDisabledComponent={t('Console is disabled in headless mode')}
            disabled={isHeadlessMode}
            hasGPU={!isEmpty(gpus)}
            vmi={vmi}
          />
        )}
        {type === SERIAL_CONSOLE_TYPE && <SerialConsoleConnector vmi={vmi} />}
        {type === DESKTOP_VIEWER_CONSOLE_TYPE && <DesktopViewer vm={vm} vmi={vmi} />}
      </StackItem>
    </Stack>
  );
};

export default Consoles;
