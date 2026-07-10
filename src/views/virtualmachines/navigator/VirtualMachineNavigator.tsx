import React, { type FC } from 'react';
import { matchPath, useLocation, useParams } from 'react-router';

import GuidedTour from '@kubevirt-utils/components/GuidedTour/GuidedTour';
import CatalogOnboardingPopover from '@kubevirt-utils/components/OnboardingPopover/components/CatalogOnboardingPopover';
import NavCollapseOnboardingPopover from '@kubevirt-utils/components/OnboardingPopover/components/NavCollapseOnboardingPopover';
import VMsTabOnboardingPopover from '@kubevirt-utils/components/OnboardingPopover/components/VMsTabOnboardingPopover';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { FLEET_VIRTUAL_MACHINES_PATH } from '@multicluster/constants';
import { isACMPath } from '@multicluster/urls';
import { Divider, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { SettingsClusterProvider } from '@settings/context/SettingsClusterContext';
import { VirtualizationFeaturesContextProvider } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import VirtualMachineNavPage from '@virtualmachines/details/VirtualMachineNavPage';
import VirtualMachinesCreateButton from '@virtualmachines/list/components/VirtualMachinesCreateButton/VirtualMachinesCreateButton';
import VirtualMachinesListPageHeader from '@virtualmachines/list/components/VirtualMachinesListPageHeader';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';
import { useTreeViewData } from '@virtualmachines/tree/hooks/useTreeViewData';
import VirtualMachineTreeView from '@virtualmachines/tree/VirtualMachineTreeView';

import WelcomeModal from '../../welcome/WelcomeModal';
import useAutoHideNavigation from '../hooks/useAutoHideNavigation/useAutoHideNavigation';
import OverviewTab from '../list/components/OverviewTab/OverviewTab';
import { OVERVIEW_TAB_INDEX, VM_LIST_TAB_INDEX } from './constants';
import useNavigatorTabs from './useNavigatorTabs';
import VirtualMachineYAMLCreatePage from './VirtualMachineYAMLCreatePage';

import './VirtualMachineNavigator.scss';

const VirtualMachineNavigator: FC = () => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const { activeTabKey, handleTabSelect } = useNavigatorTabs();

  const { cluster, ns: namespace } = useParams<{ cluster?: string; ns: string }>();
  const isFleetPage = isACMPath(location.pathname);

  const isACMVMListPage =
    matchPath(`${FLEET_VIRTUAL_MACHINES_PATH}/all-clusters/all-namespaces`, location.pathname) !==
      null ||
    matchPath(`${FLEET_VIRTUAL_MACHINES_PATH}/all-clusters/ns/:ns`, location.pathname) !== null ||
    matchPath(
      `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/all-namespaces`,
      location.pathname,
    ) !== null ||
    matchPath(`${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/ns/:ns`, location.pathname) !== null;

  const isVirtualMachineListPage =
    isACMVMListPage ||
    location.pathname.endsWith(VirtualMachineModelRef) ||
    location.pathname.endsWith(`${VirtualMachineModelRef}/`);

  const isNavCollapsed = useAutoHideNavigation();

  const treeProps = useTreeViewData();

  if (location.pathname.endsWith(`${VirtualMachineModelRef}/~new`)) {
    return <VirtualMachineYAMLCreatePage />;
  }

  return (
    <>
      <VirtualMachinesListPageHeader>
        <VirtualMachinesCreateButton namespace={namespace} />
      </VirtualMachinesListPageHeader>
      <Divider />
      <SettingsClusterProvider cluster={cluster}>
        <VirtualizationFeaturesContextProvider>
          <VirtualMachineTreeView {...treeProps}>
            {!isFleetPage && <GuidedTour />}
            {!isFleetPage && <WelcomeModal />}
            <CatalogOnboardingPopover />
            <NavCollapseOnboardingPopover isNavCollapsed={isNavCollapsed} />
            <VMsTabOnboardingPopover />
            {isVirtualMachineListPage ? (
              <Tabs
                activeKey={activeTabKey}
                aria-label={t('Virtual machines tabs')}
                className="co-horizontal-nav vm-navigator-tabs"
                onSelect={handleTabSelect}
                usePageInsets
              >
                <Tab
                  eventKey={OVERVIEW_TAB_INDEX}
                  title={<TabTitleText data-test="overview-tab">{t('Overview')}</TabTitleText>}
                >
                  <OverviewTab cluster={cluster} key="overview" namespace={namespace} />
                </Tab>
                <Tab
                  eventKey={VM_LIST_TAB_INDEX}
                  title={
                    <TabTitleText data-test="vm-list-tab">{t('Virtual machines')}</TabTitleText>
                  }
                >
                  <VirtualMachinesList
                    allVMsLoaded={treeProps.loaded}
                    cluster={cluster}
                    key={`vms-${activeTabKey}`}
                    namespace={namespace}
                  />
                </Tab>
              </Tabs>
            ) : (
              <VirtualMachineNavPage />
            )}
          </VirtualMachineTreeView>
        </VirtualizationFeaturesContextProvider>
      </SettingsClusterProvider>
    </>
  );
};

export default VirtualMachineNavigator;
