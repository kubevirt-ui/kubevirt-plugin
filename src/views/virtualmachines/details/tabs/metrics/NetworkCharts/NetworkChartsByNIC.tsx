import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkThresholdSingleSourceChart from '@kubevirt-utils/components/Charts/NetworkUtil/NetworkThresholdChartSingleSource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Grid, GridItem, Title } from '@patternfly/react-core';

import useNetworkData from './hook/useNetworkData';

type NetworkChartsByNICProps = {
  vmi: V1VirtualMachineInstance;
  nic: string;
};

const NetworkChartsByNIC: React.FC<NetworkChartsByNICProps> = ({ vmi, nic }) => {
  const { t } = useKubevirtTranslation();
  const [networkTotal, networkIn, networkOut, links] = useNetworkData(vmi, nic);

  return (
    <div>
      <Title headingLevel="h4" className="networkcharts-by-nic--title">
        {t('Network interface:')}
      </Title>{' '}
      {nic}
      <Grid>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Network in')}</CardTitle>
            <CardBody>
              <NetworkThresholdSingleSourceChart data={networkOut} link={links?.out} />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Network out')}</CardTitle>
            <CardBody>
              <NetworkThresholdSingleSourceChart data={networkIn} link={links?.in} />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Network bandwidth')}</CardTitle>
            <CardBody>
              <NetworkThresholdSingleSourceChart data={networkTotal} link={links?.total} />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </div>
  );
};

export default NetworkChartsByNIC;
