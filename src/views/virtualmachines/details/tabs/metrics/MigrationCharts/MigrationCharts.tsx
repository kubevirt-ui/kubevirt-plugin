import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MigrationThresholdChart from '@kubevirt-utils/components/Charts/MigrationUtil/MigrationThresholdChart';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

type MigrationChartsProps = {
  vmi: V1VirtualMachineInstance;
};

const MigrationCharts: React.FC<MigrationChartsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Migration chart')}</CardTitle>
          <CardBody>
            <MigrationThresholdChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('KV data transfer rate')}</CardTitle>
          <CardBody>** chart **</CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default MigrationCharts;
