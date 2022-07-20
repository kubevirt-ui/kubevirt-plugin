import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUThresholdChart from '@kubevirt-utils/components/Charts/CPUUtil/CPUThresholdChart';
import MemoryThresholdChart from '@kubevirt-utils/components/Charts/MemoryUtil/MemoryThresholdChart';
import NetworkThresholdChart from '@kubevirt-utils/components/Charts/NetworkUtil/NetworkThresholdChart';
import StorageThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageThresholdChart';
import {
  adjustDurationForStart,
  getCreationTimestamp,
  ONE_HOUR,
} from '@kubevirt-utils/components/Charts/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { GridItem } from '@patternfly/react-core';

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
