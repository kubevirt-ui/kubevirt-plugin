import React, { FC, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Grid, GridItem, SelectOption, Title } from '@patternfly/react-core';

import useQuery from '../../../../../../utils/hooks/useQuery';
import NoDataMetricsCard from '../components/NoDataMetricsCard';
import { ALL_NETWORKS } from '../utils/constants';

import NetworkChartsByNIC from './NetworkChartsByNIC';

import '../virtual-machine-metrics-tab.scss';

type NetworkChartsProps = {
  prometheusUnavailable?: boolean;
  vmi: V1VirtualMachineInstance;
};

const NetworkCharts: FC<NetworkChartsProps> = ({ prometheusUnavailable, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const interfacesNames = useMemo(() => {
    const interfaces = vmi?.spec?.domain?.devices?.interfaces?.map((nic) => nic?.name);
    interfaces?.unshift(ALL_NETWORKS);
    return interfaces;
  }, [vmi]);

  const query = useQuery();
  const [selectedNetwork, setSelectedNetwork] = useState<string>(
    query?.get('network') || ALL_NETWORKS,
  );

  if (prometheusUnavailable) {
    return (
      <Grid>
        <GridItem span={4}>
          <NoDataMetricsCard title={t('Network in')} />
        </GridItem>
        <GridItem span={4}>
          <NoDataMetricsCard title={t('Network out')} />
        </GridItem>
        <GridItem span={4}>
          <NoDataMetricsCard title={t('Network bandwidth')} />
        </GridItem>
      </Grid>
    );
  }

  return (
    <div>
      <Title className="networkcharts-by-nic--title" headingLevel="h4">
        {t('Network interface:')}
      </Title>{' '}
      <FormPFSelect
        onSelect={(_, network: string) => setSelectedNetwork(network)}
        selected={selectedNetwork}
        toggleProps={{ className: 'network ul.pf-v6-c-dropdown__menu' }}
      >
        {interfacesNames?.map((nic) => (
          <SelectOption
            onClick={() => {
              navigate({ pathname, search: `?network=${nic}` }, { replace: true });
            }}
            key={nic}
            value={nic}
          >
            {nic}
          </SelectOption>
        ))}
      </FormPFSelect>
      <NetworkChartsByNIC nic={selectedNetwork} vmi={vmi} />
    </div>
  );
};

export default NetworkCharts;
