import React from 'react';
import { useLocation } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';

import useVirtualMachineLogData from '../hooks/useVirtualMachineLogData';
import VirtualMachineBasicLogViewer from '../VirtualMachineBasicLogViewer/VirtualMachineBasicLogViewer';

import './virtual-machine-log-viewer-stand-alone.scss';

const VirtualMachineLogViewerStandAlone = () => {
  const location = useLocation();
  const locationSplitter = location.pathname.split('/');
  const ns = locationSplitter[locationSplitter.indexOf('ns') + 1];
  const name = locationSplitter[locationSplitter.indexOf(VirtualMachineModelRef) + 1];
  const { pods, vmi } = useVMIAndPodsForVM(name, ns);
  const pod = getVMIPod(vmi, pods);

  const { data } = useVirtualMachineLogData({ pod });

  return (
    <div className="VirtualMachineLogViewerStandAlone--main">
      <VirtualMachineBasicLogViewer data={data} isExternal vmi={vmi} />;
    </div>
  );
};

export default VirtualMachineLogViewerStandAlone;
