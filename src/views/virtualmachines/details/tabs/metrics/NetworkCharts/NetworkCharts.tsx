import React, { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

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
  const navigate = useNavigate();

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
      <Title className="networkcharts-by-nic--title" headingLevel="h4">
        {t('Network interface:')}
      </Title>{' '}
      <Dropdown
        dropdownItems={interfacesNames?.map((nic) => (
          <DropdownItem
            onClick={(e) => {
              setSelectedNetwork(e?.currentTarget?.innerText);
              setIsDropdownOpen(false);
              navigate(
                `/k8s/ns/${vmi?.metadata?.namespace}/kubevirt.io~v1~VirtualMachine/${vmi?.metadata?.name}/metrics?network=${nic}`,
              );
            }}
            key={nic}
          >
            {nic}
          </DropdownItem>
        ))}
        toggle={
          <DropdownToggle onToggle={(toogle) => setIsDropdownOpen(toogle)}>
            {selectedNetwork}
          </DropdownToggle>
        }
        className="network ul.pf-c-dropdown__menu"
        isOpen={isDropdownOpen}
        isPlain
        isText
      ></Dropdown>
      <NetworkChartsByNIC nic={selectedNetwork} vmi={vmi} />
    </div>
  );
};

export default NetworkCharts;
