import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { GridItem } from '@patternfly/react-core';

import { adjustDurationForStart, getCreationTimestamp, ONE_HOUR } from '../utils/utils';

import CPUThresholdChart from './CPUUtil/CPUThresholdChart';
import MemoryThresholdChart from './MemoryUtil/MemoryThresholdChart';
import NetworkThresholdChart from './NetworkUtil/NetworkThresholdChart';
import StorageThresholdChart from './StorageUtil/StorageThresholdChart';
import TimeDropdown from './TimeDropdown';

type UtilizationThresholdChartsProps = {
  vmi: V1VirtualMachineInstance;
  pods: K8sResourceCommon[];
};
const UtilizationThresholdCharts: React.FC<UtilizationThresholdChartsProps> = ({ vmi, pods }) => {
  const [duration, setDuration] = React.useState(ONE_HOUR);
  const createdAt = React.useMemo(() => getCreationTimestamp(vmi), [vmi]);
  const adjustDuration = React.useCallback(
    (start) => adjustDurationForStart(start, createdAt),
    [createdAt],
  );
  const timespan = React.useMemo(() => adjustDuration(duration), [adjustDuration, duration]);

  return (
    <>
      <GridItem span={12}>
        <TimeDropdown setDuration={setDuration} />
      </GridItem>
      <GridItem span={3}>
        <CPUThresholdChart timespan={timespan} vmi={vmi} pods={pods} />
      </GridItem>
      <GridItem span={3}>
        <MemoryThresholdChart timespan={timespan} vmi={vmi} />
      </GridItem>
      <GridItem span={3}>
        <StorageThresholdChart timespan={timespan} vmi={vmi} />
      </GridItem>
      <GridItem span={3}>
        <NetworkThresholdChart timespan={timespan} vmi={vmi} />
      </GridItem>
    </>
  );
};

export default UtilizationThresholdCharts;
