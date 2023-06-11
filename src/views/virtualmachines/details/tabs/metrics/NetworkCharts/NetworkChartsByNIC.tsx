import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkThresholdSingleSourceChart from '@kubevirt-utils/components/Charts/NetworkUtil/NetworkThresholdChartSingleSource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

import useNetworkData from './hook/useNetworkData';

type NetworkChartsByNICProps = {
  nic: string;
  vmi: V1VirtualMachineInstance;
};

const NetworkChartsByNIC: FC<NetworkChartsByNICProps> = ({ nic, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { data, links } = useNetworkData(vmi, nic);

  return (
    <div>
      <Grid>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Network in')}</CardTitle>
            <CardBody>
              <NetworkThresholdSingleSourceChart data={data?.in} link={links?.in} />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Network out')}</CardTitle>
            <CardBody>
              <NetworkThresholdSingleSourceChart data={data?.out} link={links?.out} />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Network bandwidth')}</CardTitle>
            <CardBody>
              <NetworkThresholdSingleSourceChart data={data?.total} link={links?.total} />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </div>
  );
};

export default NetworkChartsByNIC;
