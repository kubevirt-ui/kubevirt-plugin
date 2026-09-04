import React, { type JSX } from 'react';
import { useLocation } from 'react-router';

import { VirtualMachineModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useVMIAndPodForVM } from '@kubevirt-utils/resources/vm';

import useVirtualMachineLogData from '../hooks/useVirtualMachineLogData';
import VirtualMachineBasicLogViewer from '../VirtualMachineBasicLogViewer/VirtualMachineBasicLogViewer';

import './virtual-machine-log-viewer-stand-alone.scss';

const VirtualMachineLogViewerStandAlone = (): JSX.Element => {
  const location = useLocation();
  const locationSplitter = location.pathname.split('/');
  const ns = locationSplitter[locationSplitter.indexOf('ns') + 1];
  const name = locationSplitter[locationSplitter.indexOf(VirtualMachineModelRef) + 1];
  const { pod, vmi } = useVMIAndPodForVM(name, ns);

  const { data } = useVirtualMachineLogData({ pod });

  return (
    <div className="VirtualMachineLogViewerStandAlone--main">
      <VirtualMachineBasicLogViewer data={data} isExternal vmi={vmi} />
    </div>
  );
};

export default VirtualMachineLogViewerStandAlone;
