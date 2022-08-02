import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import StorageIOPSTotalThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageIOPSTotalThresholdChart';
import StorageTotalReadWriteThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageTotalReadWriteThresholdChart';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

type StorageChartsProps = {
  vmi: V1VirtualMachineInstance;
};

const StorageCharts: React.FC<StorageChartsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid>
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
          <CardTitle>{t('Storage iops total read / write')}</CardTitle>
          <CardBody>
            <StorageIOPSTotalThresholdChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default StorageCharts;
