import { useMemo } from 'react';

import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';
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
        ...getTabHrefAndName(VirtualMachineDetailsTab.Overview),
      },
      {
        component: VirtualMachineMetricsTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Metrics),
      },
      {
        component: VirtualMachineYAMLPage,
        ...getTabHrefAndName(VirtualMachineDetailsTab.YAML),
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Configurations),
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.SSH),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.InitialRun),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Storage),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Details),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Metadata),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Network),
        isHidden: true,
      },
      {
        component: VirtualMachineConfigurationTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Scheduling),
        isHidden: true,
      },
      {
        component: VirtualMachinePageEventsTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Events),
      },
      {
        component: VirtualMachineConsolePage,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Console),
      },
      {
        component: SnapshotListPage,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Snapshots),
      },
      {
        component: VirtualMachineDiagnosticTab,
        ...getTabHrefAndName(VirtualMachineDetailsTab.Diagnostics),
      },
      {
        component: VirtualMachineDiagnosticTab,
        href: `${VirtualMachineDetailsTab.Diagnostics}/${VirtualMachineDetailsTab.Tables}`,
        isHidden: true,
        name: t(VirtualMachineDetailsTabLabel.diagnostics),
      },
      {
        component: VirtualMachineDiagnosticTab,
        href: `${VirtualMachineDetailsTab.Diagnostics}/${VirtualMachineDetailsTab.Logs}`,
        isHidden: true,
        name: t(VirtualMachineDetailsTabLabel.diagnostics),
      },
    ],
    [t],
  );
  return tabs;
};
