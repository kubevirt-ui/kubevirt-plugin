import React, { useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

import NetworkChartsByNIC from './NetworkChartsByNIC';

type NetworkChartsProps = {
  vmi: V1VirtualMachineInstance;
};

const NetworkCharts: React.FC<NetworkChartsProps> = ({ vmi }) => {
  const interfacesNames = useMemo(
    () => vmi?.spec?.domain?.devices?.interfaces.map((nic) => nic?.name),
    [vmi],
  );

  return (
    <div>
      {interfacesNames?.map((nic) => (
        <NetworkChartsByNIC key={nic} vmi={vmi} nic={nic} />
      ))}
    </div>
  );
};

export default NetworkCharts;
