import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import VirtualMachineConsolePage from '../tabs/console/VirtualMachineConsolePage';
import VirtualMachineDetailsPage from '../tabs/details/VirtualMachineDetailsPage';
import DiskListPage from '../tabs/disk/tables/disk/DiskListPage';
import VirtualMachineEnvironmentPage from '../tabs/environment/VirtualMachineEnvironmentPage';
import NetworkInterfaceListPage from '../tabs/network/NetworkInterfaceListPage';
import VirtualMachinesOverviewTab from '../tabs/overview/VirtualMachinesOverviewTab';
import SnapshotListPage from '../tabs/snapshots/SnapshotListPage';
import VirtualMachineYAMLPage from '../tabs/yaml/VirtualMachineYAMLPage';

export const useVirtualMachineTabs = () => {
  const { t } = useKubevirtTranslation();

  const tabs = React.useMemo(
    () => [
      {
        href: '',
        name: t('Overview'),
        component: VirtualMachinesOverviewTab,
      },
      {
        href: 'details',
        name: t('Details'),
        component: VirtualMachineDetailsPage,
      },
      {
        href: 'yaml',
        name: 'YAML',
        component: VirtualMachineYAMLPage,
      },
      {
        href: 'environment',
        name: t('Environment'),
        component: VirtualMachineEnvironmentPage,
      },
      {
        href: 'events',
        name: t('Events'),
        component: React.Fragment,
      },
      {
        href: 'console',
        name: t('Console'),
        component: VirtualMachineConsolePage,
      },
      {
        href: 'network-interfaces',
        name: t('Network Interfaces'),
        component: NetworkInterfaceListPage,
      },
      {
        href: 'disks',
        name: t('Disks'),
        component: DiskListPage,
      },
      {
        href: 'snapshots',
        name: t('Snapshots'),
        component: SnapshotListPage,
      },
    ],
    [t],
  );

  return tabs;
};
