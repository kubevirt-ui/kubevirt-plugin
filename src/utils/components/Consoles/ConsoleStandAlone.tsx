import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import useK8sBaseAPIPath from '@multicluster/hooks/useK8sBaseAPIPath';
import { Bullseye, Spinner } from '@patternfly/react-core';

import ErrorAlert from '../ErrorAlert/ErrorAlert';
import { ModalProvider, useModalValue } from '../ModalProvider/ModalProvider';

import { getConsoleBasePath } from './utils/utils';
import Consoles from './Consoles';

const ConsoleStandAlone: FC = () => {
  const { cluster, name, ns } = useParams<{ cluster?: string; name: string; ns: string }>();
  const [apiPath, apiPathLoaded] = useK8sBaseAPIPath(cluster);
  const { vmi, vmiLoaded, vmiLoadError } = useVMI(name, ns, cluster);
  const value = useModalValue();

  if (!vmi && vmiLoadError) {
    return <ErrorAlert error={vmiLoadError} />;
  }

  if (!apiPathLoaded || !vmiLoaded)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );

  return (
    <ModalProvider value={value}>
      <Consoles
        consoleContainerClass="console-container-stand-alone"
        isHeadlessMode={isHeadlessMode(vmi)}
        isStandAlone
        isVmRunning={!vmi}
        isWindowsVM={isWindows(vmi)}
        path={getConsoleBasePath({ apiPath, name, namespace: ns })}
        vmCluster={cluster}
        vmName={name}
        vmNamespace={ns}
      />
    </ModalProvider>
  );
};

export default ConsoleStandAlone;
