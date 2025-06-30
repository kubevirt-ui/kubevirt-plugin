import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';

import ErrorAlert from '../ErrorAlert/ErrorAlert';

import { getConsoleBasePath } from './utils/utils';
import Consoles from './Consoles';

const ConsoleStandAlone: FC = () => {
  const { name, ns } = useParams<{ name: string; ns: string }>();
  const { vmi, vmiLoadError } = useVMI(name, ns);

  if (!vmi && vmiLoadError) {
    return <ErrorAlert error={vmiLoadError} />;
  }

  return (
    <Consoles
      consoleContainerClass="console-container-stand-alone"
      isHeadlessMode={isHeadlessMode(vmi)}
      isStandAlone
      isVmRunning={!vmi}
      isWindowsVM={isWindows(vmi)}
      path={getConsoleBasePath({ name, namespace: ns })}
      vmName={name}
      vmNamespace={ns}
    />
  );
};

export default ConsoleStandAlone;
