import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { PageSection, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import VirtualMachineConfigurationTabSearch from '@virtualmachines/details/tabs/configuration/search/VirtualMachineConfigurationTabSearch';
import {
  getInnerTabFromPath,
  includesConfigurationPath,
} from '@virtualmachines/details/tabs/configuration/utils/utils';

import { getTabs } from './utils/constants';

import './CustomizeInstanceTypeConfigurationTab.scss';

const CustomizeInstanceTypeConfigurationTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTabKey, setActiveTabKey] = useState<number | string>(
    VirtualMachineDetailsTab.Details,
  );

  const vm = vmSignal.value;
  const tabs = useMemo(() => getTabs(t), [t]);

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
    const innerTab = getInnerTabFromPath(location.pathname, t);
    innerTab && setActiveTabKey(innerTab);
  }, [location.pathname, t]);

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection className="ConfigurationTab">
      <VirtualMachineConfigurationTabSearch vm={vm} />
      <div className="ConfigurationTab--body">
        <Tabs activeKey={activeTabKey} className="ConfigurationTab--main" isVertical>
          {tabs.map(({ Component, name, title }) => (
            <Tab
              className="ConfigurationTab--content"
              data-test-id={`vm-configuration-${name}`}
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
    </PageSection>
  );
};

export default CustomizeInstanceTypeConfigurationTab;
