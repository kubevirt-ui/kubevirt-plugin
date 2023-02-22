import React, { FC, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { tabs } from './utils/utils';

import './virtual-machine-configuration-tab.scss';

type VirtualMachineConfigurationTabProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineConfigurationTab: FC<VirtualMachineConfigurationTabProps> = (props) => {
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  return (
    <Tabs
      activeKey={activeTabKey}
      onSelect={(_, tabIndex) => setActiveTabKey(tabIndex)}
      hasBorderBottom={false}
      className="VirtualMachineConfigurationTab--main"
    >
      {tabs.map(({ title, Component }, index) => (
        <Tab
          key={title}
          className="VirtualMachineConfigurationTab--tab-nav"
          eventKey={index}
          title={<TabTitleText>{title}</TabTitleText>}
        >
          <Component {...props} />
        </Tab>
      ))}
    </Tabs>
  );
};

export default VirtualMachineConfigurationTab;
