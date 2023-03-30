import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import useDiagnosticData from './hooks/useDianosticData';
import VirtualMachineDiagnosticTabConditions from './tables/VirtualMachineDiagnosticTabConditions';
import VirtualMachineDiagnosticTabVolumeStatus from './tables/VirtualMachineDiagnosticTabVolumeStatus';

import './virtual-machine-diagnostic-tab.scss';

type VirtualMachineDiagnosticTabProps = RouteComponentProps & {
  obj: V1VirtualMachine;
};

const VirtualMachineDiagnosticTab: FC<VirtualMachineDiagnosticTabProps> = ({ obj: vm }) => {
  const { conditions, volumeSnapshotStatuses } = useDiagnosticData(vm);

  return (
    <div className="co-m-pane__body--no-top-margin VirtualMachineDiagnosticTab--main">
      <>
        <VirtualMachineDiagnosticTabConditions conditions={conditions} />
        <VirtualMachineDiagnosticTabVolumeStatus volumeSnapshotStatuses={volumeSnapshotStatuses} />
      </>
    </div>
  );
};

export default VirtualMachineDiagnosticTab;
