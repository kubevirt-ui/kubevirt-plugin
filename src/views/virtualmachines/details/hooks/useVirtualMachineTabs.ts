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

export const useVirtualMachineTabs = () => {
  const { t } = useKubevirtTranslation();

  return [
    {
      component: VirtualMachinesOverviewTab,
      href: VirtualMachineDetailsTab.Overview,
      name: t(VirtualMachineDetailsTabLabel.Overview),
    },
    {
      component: VirtualMachineMetricsTab,
      href: VirtualMachineDetailsTab.Metrics,
      name: t(VirtualMachineDetailsTabLabel.Metrics),
    },
    {
      component: VirtualMachineYAMLPage,
      href: VirtualMachineDetailsTab.YAML,
      name: t(VirtualMachineDetailsTabLabel.YAML),
    },
    {
      component: VirtualMachineConfigurationTab,
      href: VirtualMachineDetailsTab.Configurations,
      name: t(VirtualMachineDetailsTabLabel.Configuration),
    },
    {
      component: VirtualMachineConfigurationTab,
      href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.SSH}`,
      isHidden: true,
      name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.SSH}`,
    },
    {
      component: VirtualMachineConfigurationTab,
      href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab['Initial-run']}`,
      isHidden: true,
      name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab['Initial-run']}`,
    },
    {
      component: VirtualMachineConfigurationTab,
      href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Storage}`,
      isHidden: true,
      name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Storage}`,
    },
    {
      component: VirtualMachineConfigurationTab,
      href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Details}`,
      isHidden: true,
      name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Details}`,
    },
    {
      component: VirtualMachineConfigurationTab,
      href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Metadata}`,
      isHidden: true,
      name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Metadata}`,
    },
    {
      component: VirtualMachineConfigurationTab,
      href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Network}`,
      isHidden: true,
      name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Network}`,
    },
    {
      component: VirtualMachineConfigurationTab,
      href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Scheduling}`,
      isHidden: true,
      name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Scheduling}`,
    },
    {
      component: VirtualMachinePageEventsTab,
      href: VirtualMachineDetailsTab.Events,
      name: t(VirtualMachineDetailsTabLabel.Events),
    },
    {
      component: VirtualMachineConsolePage,
      href: VirtualMachineDetailsTab.Console,
      name: t(VirtualMachineDetailsTabLabel.Console),
    },
    {
      component: SnapshotListPage,
      href: VirtualMachineDetailsTab.Snapshots,
      name: t(VirtualMachineDetailsTabLabel.Snapshots),
    },
    {
      component: VirtualMachineDiagnosticTab,
      href: VirtualMachineDetailsTab.Diagnostics,
      name: t(VirtualMachineDetailsTabLabel.Diagnostics),
    },
  ];
};
