import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUThresholdChart from '@kubevirt-utils/components/Charts/CPUUtil/CPUThresholdChart';
import MemoryThresholdChart from '@kubevirt-utils/components/Charts/MemoryUtil/MemoryThresholdChart';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

type UtilizationChartsProps = {
  vmi: V1VirtualMachineInstance;
  pods: K8sResourceCommon[];
};

const UtilizationCharts: React.FC<UtilizationChartsProps> = ({ vmi, pods }) => {
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
            <CPUThresholdChart vmi={vmi} pods={pods} />
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default UtilizationCharts;
