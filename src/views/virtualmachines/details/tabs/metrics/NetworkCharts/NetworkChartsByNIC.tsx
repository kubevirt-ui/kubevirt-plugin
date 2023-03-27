import React, { memo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Grid } from '@patternfly/react-core';

import NetworkBandwidth from './NetworkBandwidth';
import NetworkIn from './NetworkIn';
import NetworkOut from './NetworkOut';

type NetworkChartsByNICProps = {
  vmi: V1VirtualMachineInstance;
  nic: string;
};

const NetworkChartsByNIC: React.FC<NetworkChartsByNICProps> = memo(({ vmi, nic }) => {
  return (
    <div>
      <Grid>
        <NetworkIn vmi={vmi} nic={nic} />
        <NetworkOut vmi={vmi} nic={nic} />
        <NetworkBandwidth vmi={vmi} nic={nic} />
      </Grid>
    </div>
  );
});

export default NetworkChartsByNIC;
