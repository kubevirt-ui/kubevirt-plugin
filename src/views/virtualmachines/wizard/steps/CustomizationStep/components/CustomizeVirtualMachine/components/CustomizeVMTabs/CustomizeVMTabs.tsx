import React, { FC, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';

import ConfigurationSearch from '@kubevirt-utils/components/ConfigurationSearch/ConfigurationSearch';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { PageSection, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { getSearchItems } from '@virtualmachines/details/tabs/configuration/utils/search';

import { getTabs } from './utils/constants';
import { getActiveTabFromLocation, getWizardSearchUrlPath } from './utils/utils';

import './CustomizeVMTabs.scss';

const CustomizeVMTabs: FC = () => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const [activeTabKey, setActiveTabKey] = useState<number | string>(
    VirtualMachineDetailsTab.Details,
  );

  const vm = customizeWizardVMSignal.value;
  const tabs = useMemo(() => getTabs(t), [t]);
  const searchItems = useMemo(() => (vm ? getSearchItems(vm) : []), [vm]);

  useEffect(() => {
    const targetTab = getActiveTabFromLocation(location, searchItems, tabs);
    if (!targetTab) {
      return;
    }

    setActiveTabKey(targetTab);
  }, [location, searchItems, tabs]);

  // TODO: check why we return loading when vm is empty
  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <ConfigurationSearch createSearchURL={getWizardSearchUrlPath} searchItems={searchItems} />
      <div className="configuration-tab--body">
        <Tabs activeKey={activeTabKey}>
          {tabs.map(({ Component, name, title }) => (
            <Tab
              className="pf-v6-u-mt-lg"
              data-test={`vm-configuration-${name}`}
              eventKey={name}
              key={name}
              onClick={() => setActiveTabKey(name)}
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

export default CustomizeVMTabs;
