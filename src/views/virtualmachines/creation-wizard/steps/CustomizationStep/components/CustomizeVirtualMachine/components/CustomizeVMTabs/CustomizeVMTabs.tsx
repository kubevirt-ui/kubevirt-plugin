import React, { FCC, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';

import ConfigurationSearch from '@kubevirt-utils/components/ConfigurationSearch/ConfigurationSearch';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { COLON, HASH } from '@kubevirt-utils/constants/constants';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { PageSection, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { getSearchItems } from '@virtualmachines/details/tabs/configuration/utils/search';

import { getTabs } from './utils/constants';
import { getTargetTab } from './utils/utils';

import './CustomizeVMTabs.scss';

const CustomizeVMTabs: FCC = () => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const [activeTabKey, setActiveTabKey] = useState<number | string>(
    VirtualMachineDetailsTab.Details,
  );

  const vm = vmSignal.value;
  const tabs = useMemo(() => getTabs(t), [t]);
  const searchItems = useMemo(() => (vm ? getSearchItems(vm) : []), [vm]);

  const createWizardSearchURL = useCallback(
    (tab: string, elementId: string, pathname: string): string => {
      // For wizard, we just use hash-based navigation without changing the path
      return `${pathname}${HASH}${tab}${COLON}${elementId}`;
    },
    [],
  );

  // Detect hash changes and switch to the appropriate tab
  useEffect(() => {
    const hash = getTargetTab(location);
    if (!hash) return;

    // Hash format: "tabName:elementId" or just "elementId"
    const [tabFromHash, elementId] = hash.includes(COLON) ? hash.split(COLON) : [null, hash];

    const targetTab = tabFromHash || searchItems.find((item) => item.element.id === elementId)?.tab;

    if (targetTab && tabs.some((tab) => tab.name === targetTab)) {
      setActiveTabKey(targetTab);
    }
  }, [location, searchItems, tabs]);

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <ConfigurationSearch createSearchURL={createWizardSearchURL} searchItems={searchItems} />
      <div className="configuration-tab--body">
        <Tabs activeKey={activeTabKey}>
          {tabs.map(({ Component, name, title }) => (
            <Tab
              className="pf-v6-u-mt-lg"
              data-test-id={`vm-configuration-${name}`}
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
