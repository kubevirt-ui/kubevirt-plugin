import React, { FC, useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { getName } from '@kubevirt-utils/resources/shared';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { getNamespace } from '../../../../cdi-upload-provider/utils/selectors';

import VirtualMachineConfigurationTabSearch from './search/VirtualMachineConfigurationTabSearch';
import { getInnerTabFromPath, includesConfigurationPath, tabs } from './utils/utils';

import './virtual-machine-configuration-tab.scss';

type VirtualMachineConfigurationTabProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineConfigurationTab: FC<VirtualMachineConfigurationTabProps> = (props) => {
  const history = useHistory();
  const { vmi } = useVMI(getName(props?.obj), getNamespace(props?.obj));
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
    <div className="co-dashboard-body">
      <VirtualMachineConfigurationTabSearch />
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
              {activeTabKey === name && <Component {...props} vm={props?.obj} vmi={vmi} />}
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default VirtualMachineConfigurationTab;
