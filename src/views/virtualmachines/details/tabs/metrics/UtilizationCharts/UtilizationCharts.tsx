import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUThresholdChart from '@kubevirt-utils/components/Charts/CPUUtil/CPUThresholdChart';
import MemoryThresholdChart from '@kubevirt-utils/components/Charts/MemoryUtil/MemoryThresholdChart';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

type UtilizationChartsProps = {
  vmi: V1VirtualMachineInstance;
};

const UtilizationCharts: FC<UtilizationChartsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('Memory')}</CardTitle>
          <CardBody>
            <MemoryThresholdChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card>
          <CardTitle>{t('CPU')}</CardTitle>
          <CardBody>
            <CPUThresholdChart vmi={vmi} />
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default UtilizationCharts;
