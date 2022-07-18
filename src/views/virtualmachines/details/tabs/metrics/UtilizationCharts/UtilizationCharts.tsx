import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

type UtilizationChartsProps = {
  duration: string;
};

const UtilizationCharts: React.FC<UtilizationChartsProps> = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Memory')}</CardTitle>
          <CardBody>** chart **</CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('CPU')}</CardTitle>
          <CardBody>** chart **</CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Network interfaces')}</CardTitle>
          <CardBody>** chart **</CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default UtilizationCharts;
