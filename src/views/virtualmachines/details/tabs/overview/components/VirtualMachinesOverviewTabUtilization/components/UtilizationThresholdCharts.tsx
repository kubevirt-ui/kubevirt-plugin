import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUThresholdChart from '@kubevirt-utils/components/Charts/CPUUtil/CPUThresholdChart';
import MemoryThresholdChart from '@kubevirt-utils/components/Charts/MemoryUtil/MemoryThresholdChart';
import NetworkThresholdChart from '@kubevirt-utils/components/Charts/NetworkUtil/NetworkThresholdChart';
import StorageTotalReadWriteThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageTotalReadWriteThresholdChart';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { GridItem } from '@patternfly/react-core';

import TimeDropdown from './TimeDropdown';

type UtilizationThresholdChartsProps = {
  pods: K8sResourceCommon[];
  vmi: V1VirtualMachineInstance;
};
const UtilizationThresholdCharts: React.FC<UtilizationThresholdChartsProps> = ({ pods, vmi }) => {
  return (
    <>
      <GridItem span={12}>
        <TimeDropdown />
      </GridItem>
      <GridItem span={3}>
        <CPUThresholdChart pods={pods} vmi={vmi} />
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
    </>
  );
};

export default UtilizationThresholdCharts;
