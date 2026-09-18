import React, { type FC, useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useLocation } from 'react-router';

import ConfigurationSearch from '@kubevirt-utils/components/ConfigurationSearch/ConfigurationSearch';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PageSection, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { getSearchItems } from '@virtualmachines/details/tabs/configuration/utils/search';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM } from '@virtualmachines/wizard/state/vm-wizard-form/consts';

import { getTabs } from './utils/constants';
import { getActiveTabFromLocation, getWizardSearchUrlPath } from './utils/utils';

import './CustomizeVMTabs.scss';

const CustomizeVMTabs: FC = () => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const [activeTabKey, setActiveTabKey] = useState<number | string>(
    VirtualMachineDetailsTab.Details,
  );
  const { control } = useVMWizard();

  const vm = useWatch({ control, name: CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM });
  const tabs = useMemo(() => getTabs(t), [t]);
  const searchItems = useMemo(() => (vm ? getSearchItems(vm) : []), [vm]);

  useEffect(() => {
    const targetTab = getActiveTabFromLocation(location, searchItems, tabs);
    if (!targetTab) {
      return;
    }

    setActiveTabKey(targetTab);
  }, [location, searchItems, tabs]);

  // Check why we return loading when vm is empty
  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <ConfigurationSearch createSearchURL={getWizardSearchUrlPath} searchItems={searchItems} />
      <div className="configuration-tab--body">
        <Tabs activeKey={activeTabKey}>
          {tabs.map((tab) => (
            <Tab
              className="pf-v6-u-mt-lg"
              data-test={`vm-configuration-${tab.name}`}
              eventKey={tab.name}
              key={tab.name}
              onClick={() => setActiveTabKey(tab.name)}
              title={<TabTitleText>{tab.title}</TabTitleText>}
            >
              {activeTabKey === tab.name && <tab.Component />}
            </Tab>
          ))}
        </Tabs>
      </div>
    </PageSection>
  );
};

export default CustomizeVMTabs;
