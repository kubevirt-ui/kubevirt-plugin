import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CPUThresholdChart from '@kubevirt-utils/components/Charts/CPUUtil/CPUThresholdChart';
import MemoryThresholdChart from '@kubevirt-utils/components/Charts/MemoryUtil/MemoryThresholdChart';
import NetworkThresholdChart from '@kubevirt-utils/components/Charts/NetworkUtil/NetworkThresholdChart';
import StorageTotalReadWriteThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageTotalReadWriteThresholdChart';
import { Grid, GridItem } from '@patternfly/react-core';

type UtilizationThresholdChartsProps = {
  vmi: V1VirtualMachineInstance;
};
const UtilizationThresholdCharts: React.FC<UtilizationThresholdChartsProps> = ({ vmi }) => {
  return (
    <Grid>
      <GridItem span={3}>
        <CPUThresholdChart vmi={vmi} />
      </GridItem>
      <GridItem span={3}>
        <MemoryThresholdChart vmi={vmi} />
      </GridItem>
      <GridItem span={3}>
        <StorageTotalReadWriteThresholdChart vmi={vmi} />
      </GridItem>
      <GridItem span={3}>
        <NetworkThresholdChart vmi={vmi} />
      </GridItem>
    </Grid>
  );
};

export default UtilizationThresholdCharts;
