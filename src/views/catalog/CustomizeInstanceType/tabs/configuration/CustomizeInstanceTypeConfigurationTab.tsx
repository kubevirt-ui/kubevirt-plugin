import React, { FC, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import VirtualMachineConfigurationTabSearch from '@virtualmachines/details/tabs/configuration/search/VirtualMachineConfigurationTabSearch';
import {
  getInnerTabFromPath,
  includesConfigurationPath,
} from '@virtualmachines/details/tabs/configuration/utils/utils';

import { tabs } from './utils/constants';

import './CustomizeInstanceTypeConfigurationTab.scss';

const CustomizeInstanceTypeConfigurationTab: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTabKey, setActiveTabKey] = useState<number | string>(
    VirtualMachineDetailsTab.Details,
  );

  const vm = vmSignal.value;

  const redirectTab = useCallback(
    (name: string) => {
      setActiveTabKey(name);
      const redirectPath = includesConfigurationPath(
        location.pathname,
        `${VirtualMachineDetailsTab.Configurations}/${name}`,
      );
      navigate(redirectPath);
    },
    [location.pathname, navigate],
  );

  useEffect(() => {
    const innerTab = getInnerTabFromPath(location.pathname);
    innerTab && setActiveTabKey(innerTab);
  }, [location.pathname]);

  if (!vm) {
    return <Loading />;
  }

  return (
    <div className="co-dashboard-body ConfigurationTab">
      <VirtualMachineConfigurationTabSearch vm={vm} />
      <div className="ConfigurationTab--body">
        <Tabs activeKey={activeTabKey} className="ConfigurationTab--main" isVertical>
          {tabs.map(({ Component, name, title }) => (
            <Tab
              className="ConfigurationTab--content"
              eventKey={name}
              key={name}
              onClick={() => redirectTab(name)}
              title={<TabTitleText>{title}</TabTitleText>}
            >
              {activeTabKey === name && <Component />}
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default CustomizeInstanceTypeConfigurationTab;
