import React, { FC, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Dropdown, DropdownItem, DropdownToggle, Title } from '@patternfly/react-core';

import { ALL_NETWORKS } from '../utils/constants';

import useQuery from './hook/useQuery';
import NetworkChartsByNIC from './NetworkChartsByNIC';

import '../virtual-machine-metrics-tab.scss';

type NetworkChartsProps = {
  vmi: V1VirtualMachineInstance;
};

const NetworkCharts: FC<NetworkChartsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const interfacesNames = useMemo(() => {
    const interfaces = vmi?.spec?.domain?.devices?.interfaces?.map((nic) => nic?.name);
    interfaces?.unshift(ALL_NETWORKS);
    return interfaces;
  }, [vmi]);

  const query = useQuery();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>(
    query?.get('network') || ALL_NETWORKS,
  );

  return (
    <div>
      <Title headingLevel="h4" className="networkcharts-by-nic--title">
        {t('Network interface:')}
      </Title>{' '}
      <Dropdown
        className="network ul.pf-c-dropdown__menu"
        isPlain
        isText
        dropdownItems={interfacesNames?.map((nic) => (
          <DropdownItem
            key={nic}
            onClick={(e) => {
              setSelectedNetwork(e?.currentTarget?.innerText);
              setIsDropdownOpen(false);
              history?.push(
                `/k8s/ns/${vmi?.metadata?.namespace}/kubevirt.io~v1~VirtualMachine/${vmi?.metadata?.name}/metrics?network=${nic}`,
              );
            }}
          >
            {nic}
          </DropdownItem>
        ))}
        isOpen={isDropdownOpen}
        toggle={
          <DropdownToggle onToggle={(toogle) => setIsDropdownOpen(toogle)}>
            {selectedNetwork}
          </DropdownToggle>
        }
      ></Dropdown>
      <NetworkChartsByNIC vmi={vmi} nic={selectedNetwork} />
    </div>
  );
};

export default NetworkCharts;
