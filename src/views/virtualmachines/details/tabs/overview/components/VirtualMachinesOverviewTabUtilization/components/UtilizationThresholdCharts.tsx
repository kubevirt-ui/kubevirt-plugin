import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUThresholdChart from '@kubevirt-utils/components/Charts/CPUUtil/CPUThresholdChart';
import MemoryThresholdChart from '@kubevirt-utils/components/Charts/MemoryUtil/MemoryThresholdChart';
import NetworkThresholdChart from '@kubevirt-utils/components/Charts/NetworkUtil/NetworkThresholdChart';
import StorageWriteThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageWriteThresholdChart';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { GridItem } from '@patternfly/react-core';

import TimeDropdown from './TimeDropdown';

type UtilizationThresholdChartsProps = {
  vmi: V1VirtualMachineInstance;
  pods: K8sResourceCommon[];
};
const UtilizationThresholdCharts: React.FC<UtilizationThresholdChartsProps> = ({ vmi, pods }) => {
  return (
    <>
      <GridItem span={12}>
        <TimeDropdown />
      </GridItem>
      <GridItem span={3}>
        <CPUThresholdChart vmi={vmi} pods={pods} />
      </GridItem>
      <GridItem span={3}>
        <MemoryThresholdChart vmi={vmi} />
      </GridItem>
      <GridItem span={3}>
        <StorageWriteThresholdChart vmi={vmi} />
      </GridItem>
      <GridItem span={3}>
        <NetworkThresholdChart vmi={vmi} />
      </GridItem>
    </>
  );
};

export default UtilizationThresholdCharts;
