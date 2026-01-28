import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import StorageIOPSTotalThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageIOPSTotalThresholdChart';
import StorageReadLatencyAvgMaxChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageReadLatencyAvgMaxChart';
import StorageReadLatencyPerDriveChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageReadLatencyPerDriveChart';
import StorageTotalReadWriteThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageTotalReadWriteThresholdChart';
import StorageWriteLatencyAvgMaxChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageWriteLatencyAvgMaxChart';
import StorageWriteLatencyPerDriveChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageWriteLatencyPerDriveChart';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

type StorageChartsProps = {
  vmi: V1VirtualMachineInstance;
};

const StorageCharts: React.FC<StorageChartsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid hasGutter>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Storage total read / write')}</CardTitle>
          <CardBody>
            <StorageTotalReadWriteThresholdChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Storage IOPS total read / write')}</CardTitle>
          <CardBody>
            <StorageIOPSTotalThresholdChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Storage Read Avg/Max Latency (all drives)')}</CardTitle>
          <CardBody>
            <StorageReadLatencyAvgMaxChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Storage Write Avg/Max Latency (all drives)')}</CardTitle>
          <CardBody>
            <StorageWriteLatencyAvgMaxChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Storage Read Latency per Drive')}</CardTitle>
          <CardBody>
            <StorageReadLatencyPerDriveChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Storage Write Latency per Drive')}</CardTitle>
          <CardBody>
            <StorageWriteLatencyPerDriveChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default StorageCharts;
