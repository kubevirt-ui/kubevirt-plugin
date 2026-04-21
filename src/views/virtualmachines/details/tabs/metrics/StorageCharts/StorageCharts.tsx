import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import StorageIOPSTotalThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageIOPSTotalThresholdChart';
import StorageReadLatencyAvgMaxChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageReadLatencyAvgMaxChart';
import StorageReadLatencyPerDriveChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageReadLatencyPerDriveChart';
import StorageTotalReadWriteThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageTotalReadWriteThresholdChart';
import StorageWriteLatencyAvgMaxChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageWriteLatencyAvgMaxChart';
import StorageWriteLatencyPerDriveChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageWriteLatencyPerDriveChart';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

import NoDataMetricsCard from '../components/NoDataMetricsCard';

type StorageChartsProps = {
  prometheusUnavailable?: boolean;
  vmi: V1VirtualMachineInstance;
};

const STORAGE_CHART_COMPONENTS = [
  { Chart: StorageTotalReadWriteThresholdChart, titleKey: 'Storage total read / write' },
  { Chart: StorageIOPSTotalThresholdChart, titleKey: 'Storage IOPS total read / write' },
  { Chart: StorageReadLatencyAvgMaxChart, titleKey: 'Storage Read Avg/Max Latency (all drives)' },
  { Chart: StorageWriteLatencyAvgMaxChart, titleKey: 'Storage Write Avg/Max Latency (all drives)' },
  { Chart: StorageReadLatencyPerDriveChart, titleKey: 'Storage Read Latency per Drive' },
  { Chart: StorageWriteLatencyPerDriveChart, titleKey: 'Storage Write Latency per Drive' },
];

const StorageCharts: FC<StorageChartsProps> = ({ prometheusUnavailable, vmi }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid hasGutter>
      {STORAGE_CHART_COMPONENTS.map(({ Chart, titleKey }) => {
        const title = t(titleKey);
        return (
          <GridItem key={titleKey} span={6}>
            {prometheusUnavailable ? (
              <NoDataMetricsCard title={title} />
            ) : (
              <Card>
                <CardTitle>{title}</CardTitle>
                <CardBody>
                  <Chart vmi={vmi} />
                </CardBody>
              </Card>
            )}
          </GridItem>
        );
      })}
    </Grid>
  );
};

export default StorageCharts;
