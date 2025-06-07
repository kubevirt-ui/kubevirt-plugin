import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm/hooks';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';

import { getConsolePath } from './utils/utils';
import StableConsole from './StableConsole';

const ConsoleStandAlone: FC = () => {
  const { name, ns } = useParams<{ name: string; ns: string }>();
  const { vmi } = useVMIAndPodsForVM(name, ns);

  return (
    <StableConsole
      consoleContainerClass="console-container-stand-alone"
      isHeadlessMode={isHeadlessMode(vmi)}
      isStandAlone
      isVmRunning={!vmi}
      isWindowsVM={isWindows(vmi)}
      path={getConsolePath({ name, namespace: ns })}
    />
  );
};

export default ConsoleStandAlone;
