import React from 'react';
import { useParams } from 'react-router-dom';

import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';

import useVirtualMachineLogData from '../hooks/useVirtualMachineLogData';
import VirtualMachineBasicLogViewer from '../VirtualMachineBasicLogViewer/VirtualMachineBasicLogViewer';

import './virtual-machine-log-viewer-stand-alone.scss';

const VirtualMachineLogViewerStandAlone = () => {
  const params = useParams<{ name: string; ns: string }>();
  const { pods, vmi } = useVMIAndPodsForVM(params?.name, params?.ns);
  const pod = getVMIPod(vmi, pods);

  const { data } = useVirtualMachineLogData({ pod });

  return (
    <div className="VirtualMachineLogViewerStandAlone--main">
      <VirtualMachineBasicLogViewer data={data} isExternal vmi={vmi} />;
    </div>
  );
};

export default VirtualMachineLogViewerStandAlone;
