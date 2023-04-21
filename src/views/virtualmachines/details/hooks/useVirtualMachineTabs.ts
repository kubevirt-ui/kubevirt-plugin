import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NETWORK } from '@virtualmachines/utils';

import VirtualMachineConfigurationTab from '../tabs/configuration/VirtualMachineConfigurationTab';
import VirtualMachineConsolePage from '../tabs/console/VirtualMachineConsolePage';
import VirtualMachineDetailsPage from '../tabs/details/VirtualMachineDetailsPage';
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
      href: VirtualMachineDetailsTab.Overview,
      name: t(VirtualMachineDetailsTabLabel.Overview),
      component: VirtualMachinesOverviewTab,
    },
    {
      href: VirtualMachineDetailsTab.Details,
      name: t(VirtualMachineDetailsTabLabel.Details),
      component: VirtualMachineDetailsPage,
    },
    {
      href: VirtualMachineDetailsTab.Metrics,
      name: t(VirtualMachineDetailsTabLabel.Metrics),
      component: VirtualMachineMetricsTab,
    },
    {
      href: VirtualMachineDetailsTab.YAML,
      name: t(VirtualMachineDetailsTabLabel.YAML),
      component: VirtualMachineYAMLPage,
    },
    {
      href: VirtualMachineDetailsTab.Configurations,
      name: t(VirtualMachineDetailsTabLabel.Configuration),
      component: VirtualMachineConfigurationTab,
    },
    {
      href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Disks}`,
      name: 'hide',
      component: VirtualMachineConfigurationTab,
    },
    {
      href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Environment}`,
      name: 'hide',
      component: VirtualMachineConfigurationTab,
    },
    {
      href: `${VirtualMachineDetailsTab.Configurations}/${NETWORK}`,
      name: 'hide',
      component: VirtualMachineConfigurationTab,
    },
    {
      href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Scheduling}`,
      name: 'hide',
      component: VirtualMachineConfigurationTab,
    },
    {
      href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Scripts}`,
      name: 'hide',
      component: VirtualMachineConfigurationTab,
    },
    {
      href: VirtualMachineDetailsTab.Events,
      name: t(VirtualMachineDetailsTabLabel.Events),
      component: VirtualMachinePageEventsTab,
    },
    {
      href: VirtualMachineDetailsTab.Console,
      name: t(VirtualMachineDetailsTabLabel.Console),
      component: VirtualMachineConsolePage,
    },
    {
      href: VirtualMachineDetailsTab.Snapshots,
      name: t(VirtualMachineDetailsTabLabel.Snapshots),
      component: SnapshotListPage,
    },
    {
      href: VirtualMachineDetailsTab.Diagnostics,
      name: t(VirtualMachineDetailsTabLabel.Diagnostics),
      component: VirtualMachineDiagnosticTab,
    },
  ];
};
