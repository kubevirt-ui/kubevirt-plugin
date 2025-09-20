import { useMemo } from 'react';

import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import VirtualMachineConfigurationTab from '../tabs/configuration/VirtualMachineConfigurationTab';
import VirtualMachineConsolePage from '../tabs/console/VirtualMachineConsolePage';
import VirtualMachineDiagnosticTab from '../tabs/diagnostic/VirtualMachineDiagnosticTab';
import VirtualMachinePageEventsTab from '../tabs/events/VirtualMachinePageEvents';
import VirtualMachineMetricsTab from '../tabs/metrics/VirtualMachineMetricsTab';
import VirtualMachinesOverviewTab from '../tabs/overview/VirtualMachinesOverviewTab';
import SnapshotListPage from '../tabs/snapshots/SnapshotListPage';
import VirtualMachineYAMLPage from '../tabs/yaml/VirtualMachineYAMLPage';
import { getTabHrefAndName } from '../utils/utils';

export const useVirtualMachineTabs = () => {
  const { t } = useKubevirtTranslation();

  const tabs = useMemo(
    () => [
      {
        component: VirtualMachinesOverviewTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Overview, t),
      },
      {
        component: VirtualMachineMetricsTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Metrics, t),
      },
      {
        component: VirtualMachineYAMLPage,
        ...getTabHrefAndName(VirtualMachineDetailsTab.YAML, t),
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Configurations, t),
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.SSH, t),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.InitialRun, t),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Storage, t),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Details, t),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Metadata, t),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Network, t),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Scheduling, t),
        isHidden: true,
      },
      {
        component: VirtualMachinePageEventsTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Events, t),
      },
      {
        component: VirtualMachineConsolePage,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Console, t),
      },
      {
        component: SnapshotListPage,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Snapshots, t),
      },
      {
        component: VirtualMachineDiagnosticTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Diagnostics, t),
      },
      {
        component: VirtualMachineDiagnosticTab,
        href: `${VirtualMachineDetailsTab.Diagnostics}/${VirtualMachineDetailsTab.Tables}`,
        isHidden: true,
        name: t('Diagnostics'),
      },
      {
        component: VirtualMachineDiagnosticTab,
        href: `${VirtualMachineDetailsTab.Diagnostics}/${VirtualMachineDetailsTab.Logs}`,
        isHidden: true,
        name: t('Diagnostics'),
      },
    ],
    [t],
  );
  return tabs;
};
