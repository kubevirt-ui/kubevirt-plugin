import React, { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { SelectOption, Title } from '@patternfly/react-core';

import { ALL_NETWORKS } from '../utils/constants';

import useQuery from './hook/useQuery';
import NetworkChartsByNIC from './NetworkChartsByNIC';

import '../virtual-machine-metrics-tab.scss';

type NetworkChartsProps = {
  vmi: V1VirtualMachineInstance;
};

const NetworkCharts: FC<NetworkChartsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
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

  return (
    <div>
      <Title className="networkcharts-by-nic--title" headingLevel="h4">
        {t('Network interface:')}
      </Title>{' '}
      <FormPFSelect
        className="network ul.pf-c-dropdown__menu"
        onSelect={(_, network: string) => setSelectedNetwork(network)}
        selected={selectedNetwork}
      >
        {interfacesNames?.map((nic) => (
          <SelectOption
            onClick={() => {
              navigate(
                `/k8s/ns/${getNamespace(vmi)}/${VirtualMachineModelRef}/${getName(
                  vmi,
                )}/metrics?network=${nic}`,
              );
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
