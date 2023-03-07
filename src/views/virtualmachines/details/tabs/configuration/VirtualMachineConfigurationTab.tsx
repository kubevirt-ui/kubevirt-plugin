import React, { FC, useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { getInnerTabFromPath, includesConfigurationPath, tabs } from './utils/utils';

import './virtual-machine-configuration-tab.scss';

type VirtualMachineConfigurationTabProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineConfigurationTab: FC<VirtualMachineConfigurationTabProps> = (props) => {
  const { history } = props;

  const [activeTabKey, setActiveTabKey] = useState<string | number>(
    VirtualMachineDetailsTab.Scheduling,
  );

  const redirectTab = useCallback(
    (name: string) => {
      const isConfiguration = includesConfigurationPath(history.location.pathname);
      history.push(isConfiguration ? name : `${VirtualMachineDetailsTab.Configurations}/${name}`);
      setActiveTabKey(name);
    },
    [history],
  );

  useEffect(() => {
    const innerTab = getInnerTabFromPath(history.location.pathname);
    innerTab && setActiveTabKey(innerTab);
  }, [history.location.pathname]);

  return (
    <Tabs
      activeKey={activeTabKey}
      hasBorderBottom={false}
      className="VirtualMachineConfigurationTab--main"
    >
      {tabs.map(({ title, Component, name }) => (
        <Tab
          key={name}
          className="VirtualMachineConfigurationTab--tab-nav"
          eventKey={name}
          onClick={() => redirectTab(name)}
          title={<TabTitleText>{title}</TabTitleText>}
        >
          {activeTabKey === name && <Component {...props} />}
        </Tab>
      ))}
    </Tabs>
  );
};

export default VirtualMachineConfigurationTab;
