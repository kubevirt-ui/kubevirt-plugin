import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/components/PendingChanges/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import VirtualMachineConsolePage from '../tabs/console/VirtualMachineConsolePage';
import VirtualMachineDetailsPage from '../tabs/details/VirtualMachineDetailsPage';
import DiskListPage from '../tabs/disk/DiskListPage';
import VirtualMachineEnvironmentPage from '../tabs/environment/VirtualMachineEnvironmentPage';
import VirtualMachinePageEventsTab from '../tabs/events/VirtualMachinePageEvents';
import VirtualMachineMetricsTab from '../tabs/metrics/VirtualMachineMetricsTab';
import NetworkInterfaceListPage from '../tabs/network/NetworkInterfaceListPage';
import VirtualMachinesOverviewTab from '../tabs/overview/VirtualMachinesOverviewTab';
import VirtualMachineSchedulingPage from '../tabs/scheduling/VirtualMachineSchedulingPage';
import ScriptsTab from '../tabs/scripts/ScriptsTab';
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
      href: VirtualMachineDetailsTab.Scheduling,
      name: t(VirtualMachineDetailsTabLabel.Scheduling),
      component: VirtualMachineSchedulingPage,
    },
    {
      href: VirtualMachineDetailsTab.Environment,
      name: t(VirtualMachineDetailsTabLabel.Environment),
      component: VirtualMachineEnvironmentPage,
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
      href: VirtualMachineDetailsTab.NetworkInterfaces,
      name: t(VirtualMachineDetailsTabLabel.NetworkInterfaces),
      component: NetworkInterfaceListPage,
    },
    {
      href: VirtualMachineDetailsTab.Disks,
      name: t(VirtualMachineDetailsTabLabel.Disks),
      component: DiskListPage,
    },
    {
      href: VirtualMachineDetailsTab.Scripts,
      name: t(VirtualMachineDetailsTabLabel.Scripts),
      component: ScriptsTab,
    },
    {
      href: VirtualMachineDetailsTab.Snapshots,
      name: t(VirtualMachineDetailsTabLabel.Snapshots),
      component: SnapshotListPage,
    },
  ];
};
