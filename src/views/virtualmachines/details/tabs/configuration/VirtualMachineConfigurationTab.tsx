import React, { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useLocation } from 'react-router-dom-v5-compat';

import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { getName } from '@kubevirt-utils/resources/shared';
import useInstanceTypeExpandSpec from '@kubevirt-utils/resources/vm/hooks/useInstanceTypeExpandSpec';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import { getNamespace } from '../../../../cdi-upload-provider/utils/selectors';

import VirtualMachineConfigurationTabSearch from './search/VirtualMachineConfigurationTabSearch';
import { getInnerTabFromPath, includesConfigurationPath, tabs } from './utils/utils';

import './virtual-machine-configuration-tab.scss';

const VirtualMachineConfigurationTab: FC<NavPageComponentProps> = ({ vm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vmi } = useVMI(getName(vm), getNamespace(vm));
  const [instanceTypeVM] = useInstanceTypeExpandSpec(vm);
  const [activeTabKey, setActiveTabKey] = useState<number | string>(
    VirtualMachineDetailsTab.Details,
  );

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

  return (
    <div className="co-dashboard-body VirtualMachineConfigurationTab">
      <VirtualMachineConfigurationTabSearch vm={vm} />
      <div className="VirtualMachineConfigurationTab--body">
        <Tabs activeKey={activeTabKey} className="VirtualMachineConfigurationTab--main" isVertical>
          {tabs.map(({ Component, name, title }) => (
            <Tab
              className="VirtualMachineConfigurationTab--content"
              eventKey={name}
              key={name}
              onClick={() => redirectTab(name)}
              title={<TabTitleText>{title}</TabTitleText>}
            >
              {activeTabKey === name && (
                <Component instanceTypeVM={instanceTypeVM} vm={vm} vmi={vmi} />
              )}
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default VirtualMachineConfigurationTab;
