import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import StorageReadThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageReadThresholdChart';
import StorageWriteThresholdChart from '@kubevirt-utils/components/Charts/StorageUtil/StorageWriteThresholdChart';
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
          <CardTitle>{t('Storage write')}</CardTitle>
          <CardBody>
            <StorageWriteThresholdChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Storage read')}</CardTitle>
          <CardBody>
            <StorageReadThresholdChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default StorageCharts;
