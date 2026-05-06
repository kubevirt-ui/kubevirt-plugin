import React, { FC } from 'react';
import { useParams } from 'react-router';

import { V1VirtualMachine } from '@kubev2v/types';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import useK8sBaseAPIPath from '@multicluster/hooks/useK8sBaseAPIPath';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { useIsFleetAvailable } from '@stolostron/multicluster-sdk';

import ErrorAlert from '../ErrorAlert/ErrorAlert';
import { ModalProvider, useModalValue } from '../ModalProvider/ModalProvider';

import { KUBEVIRT_UI_VNC_LOG_LEVEL_LABEL } from './components/vnc-console/utils/constants';
import { isVncLogLevel } from './components/vnc-console/utils/util';
import { getConsoleBasePath } from './utils/utils';
import Consoles from './Consoles';

const ConsoleStandAlone: FC = () => {
  const { cluster, name, ns } = useParams<{ cluster?: string; name: string; ns: string }>();
  const [apiPath, apiPathLoaded] = useK8sBaseAPIPath(cluster);
  const [vm, vmLoaded, vmLoadError] = useK8sWatchData<V1VirtualMachine>({
    cluster,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    name,
    namespace: ns,
  });
  const { vmi, vmiLoadError } = useVMI(name, ns, cluster);
  const isFleetAvailable = useIsFleetAvailable();
  const value = useModalValue();

  // For local/no-cluster flows show errors immediately; for fleet/spoke flows wait
  // until the fleet SDK is initialised to avoid false positives during startup.
  if (!vmi && vmiLoadError && (!cluster || isFleetAvailable)) {
    return <ErrorAlert error={vmiLoadError} />;
  }

  const waitingForVm = !vmLoaded && !vmLoadError;

  if (!apiPathLoaded || waitingForVm)
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  const logLevelLabel = vm && getLabel(vm, KUBEVIRT_UI_VNC_LOG_LEVEL_LABEL);
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
        vncLogLevel={isVncLogLevel(logLevelLabel) ? logLevelLabel : false}
      />
    </ModalProvider>
  );
};

export default ConsoleStandAlone;
