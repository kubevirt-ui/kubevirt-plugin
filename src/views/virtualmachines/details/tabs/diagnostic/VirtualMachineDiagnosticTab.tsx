import React, { FC, useState } from 'react';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import useDiagnosticData from './hooks/useDianosticData';
import VirtualMachineDiagnosticTabConditions from './tables/VirtualMachineDiagnosticTabConditions';
import VirtualMachineDiagnosticTabVolumeStatus from './tables/VirtualMachineDiagnosticTabVolumeStatus';
import VirtualMachineLogViewer from './VirtualMachineLogViewer/VirtualMachineLogViewer';

import './virtual-machine-diagnostic-tab.scss';

const VirtualMachineDiagnosticTab: FC<NavPageComponentProps> = ({ vm }) => {
  const { conditions, volumeSnapshotStatuses } = useDiagnosticData(vm);
  const [activeTabKey, setActiveTabKey] = useState<number>(0);

  return (
    <div className="VirtualMachineDiagnosticTab--main">
      <Tabs
        activeKey={activeTabKey}
        className="VirtualMachineDiagnosticTab--main__tabs"
        isVertical
        onSelect={(_, key: number) => setActiveTabKey(key)}
      >
        <Tab
          className="VirtualMachineDiagnosticTab--main__content"
          eventKey={0}
          title={<TabTitleText>Status & Conditions</TabTitleText>}
        >
          <VirtualMachineDiagnosticTabConditions conditions={conditions} />
          <VirtualMachineDiagnosticTabVolumeStatus
            volumeSnapshotStatuses={volumeSnapshotStatuses}
          />
        </Tab>
        <Tab
          className="VirtualMachineDiagnosticTab--main__content"
          eventKey={1}
          title={<TabTitleText>Guest system access log</TabTitleText>}
        >
          <VirtualMachineLogViewer connect={activeTabKey === 1} vm={vm} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default VirtualMachineDiagnosticTab;
