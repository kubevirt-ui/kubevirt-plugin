import React, { FC, useCallback, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom-v5-compat';

import CreateResourceDefaultPage from '@kubevirt-utils/components/CreateResourceDefaultPage/CreateResourceDefaultPage';
import GuidedTour from '@kubevirt-utils/components/GuidedTour/GuidedTour';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { Divider, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import SearchBar from '@search/components/SearchBar';
import VirtualMachineNavPage from '@virtualmachines/details/VirtualMachineNavPage';
import VirtualMachinesListPageHeader from '@virtualmachines/list/components/VirtualMachinesListPageHeader';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';
import { useTreeViewData } from '@virtualmachines/tree/hooks/useTreeViewData';
import VirtualMachineTreeView from '@virtualmachines/tree/VirtualMachineTreeView';

import { defaultVMYamlTemplate } from '../../../templates';
import OverviewTab from '../list/components/OverviewTab/OverviewTab';

import { OVERVIEW_TAB_INDEX, VM_LIST_TAB_INDEX } from './constants';
import useNavigatorTabs from './useNavigatorTabs';

import './VirtualMachineNavigator.scss';

const VirtualMachineNavigator: FC = () => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const vmListRef = useRef<{ onFilterChange: OnFilterChange } | null>(null);
  const location = useLocation();
  const { activeTabKey, handleTabSelect } = useNavigatorTabs();

  const { cluster, ns: namespace } = useParams<{ cluster?: string; ns: string }>();

  const isVirtualMachineListPage =
    location.pathname.endsWith(VirtualMachineModelRef) ||
    location.pathname.endsWith(`${VirtualMachineModelRef}/`);

  const treeProps = useTreeViewData();

  const onFilterChange: OnFilterChange = useCallback((type, value) => {
    vmListRef.current?.onFilterChange(type, value);
  }, []);

  if (location.pathname.endsWith(`${VirtualMachineModelRef}/~new`)) {
    return (
      <CreateResourceDefaultPage
        header={t('Create VirtualMachine')}
        initialResource={defaultVMYamlTemplate()}
      />
    );
  }

  return (
    <>
      <VirtualMachinesListPageHeader namespace={namespace} />
      <Divider />
      <VirtualMachineTreeView onFilterChange={onFilterChange} {...treeProps}>
        <GuidedTour />
        {isVirtualMachineListPage ? (
          <Tabs
            activeKey={activeTabKey}
            aria-label={t('Virtual machines tabs')}
            className="co-horizontal-nav vm-navigator-tabs"
            onSelect={handleTabSelect}
          >
            <Tab
              eventKey={OVERVIEW_TAB_INDEX}
              title={<TabTitleText data-test="overview-tab">{t('Overview')}</TabTitleText>}
            >
              <OverviewTab cluster={cluster} key="overview" namespace={namespace} />
            </Tab>
            <Tab
              eventKey={VM_LIST_TAB_INDEX}
              title={<TabTitleText data-test="vm-list-tab">{t('VirtualMachines')}</TabTitleText>}
            >
              <div className="vm-search-bar-container">
                <SearchBar onFilterChange={onFilterChange} />
              </div>
              <VirtualMachinesList
                allVMsLoaded={treeProps.loaded}
                cluster={cluster}
                key={`vms-${activeTabKey}`}
                kind={VirtualMachineModelRef}
                namespace={namespace}
                ref={vmListRef}
              />
            </Tab>
          </Tabs>
        ) : (
          <VirtualMachineNavPage />
        )}
      </VirtualMachineTreeView>
    </>
  );
};

export default VirtualMachineNavigator;
