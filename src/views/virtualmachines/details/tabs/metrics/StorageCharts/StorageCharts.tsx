import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

type StorageChartsProps = {
  duration: string;
};

const StorageCharts: React.FC<StorageChartsProps> = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Storage chart name 1')}</CardTitle>
          <CardBody>** chart **</CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Storage chart name 2')}</CardTitle>
          <CardBody>** chart **</CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default StorageCharts;
