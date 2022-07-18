import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

type MigrationChartsProps = {
  duration: string;
};

const MigrationCharts: React.FC<MigrationChartsProps> = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Migration chart')}</CardTitle>
          <CardBody>** chart **</CardBody>
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
