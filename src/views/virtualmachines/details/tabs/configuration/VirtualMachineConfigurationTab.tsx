import React, { FC, useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { getInnerTabFromPath, includesConfigurationPath, tabs } from './utils/utils';

import './virtual-machine-configuration-tab.scss';

type VirtualMachineConfigurationTabProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineConfigurationTab: FC<VirtualMachineConfigurationTabProps> = (props) => {
  const { history } = props;
  const { vmi } = useVMI(props?.obj?.metadata?.name, props?.obj?.metadata?.namespace);
  const [activeTabKey, setActiveTabKey] = useState<number | string>(
    VirtualMachineDetailsTab.Details,
  );

  const redirectTab = useCallback(
    (name: string) => {
      setActiveTabKey(name);
      const isConfiguration = includesConfigurationPath(history.location.pathname);
      history.push(isConfiguration ? name : `${VirtualMachineDetailsTab.Configurations}/${name}`);
    },
    [history],
  );

  useEffect(() => {
    const innerTab = getInnerTabFromPath(history.location.pathname);
    innerTab && setActiveTabKey(innerTab);
  }, [history.location.pathname]);

  return (
    <div className="VirtualMachineConfigurationTab">
      <Tabs activeKey={activeTabKey} className="VirtualMachineConfigurationTab--main" isVertical>
        {tabs.map(({ Component, name, title }) => (
          <Tab
            className="VirtualMachineConfigurationTab--content"
            eventKey={name}
            key={name}
            onClick={() => redirectTab(name)}
            title={<TabTitleText>{title}</TabTitleText>}
          >
            {activeTabKey === name && <Component {...props} vmi={vmi} />}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default VirtualMachineConfigurationTab;
