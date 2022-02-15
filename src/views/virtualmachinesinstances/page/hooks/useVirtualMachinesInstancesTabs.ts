import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import VirtualMachinesInstancesPageConsoleTab from '../tabs/console/VirtualMachinesInstancesPageConsoleTab';
import VirtualMachinesInstancesPageDetailsTab from '../tabs/details/VirtualMachinesInstancesPageDetailsTab';
import VirtualMachinesInstancesPageDisksTab from '../tabs/disks/VirtualMachinesInstancesPageDisksTab';
import VirtualMachinesInstancesPageEventsTab from '../tabs/events/VirtualMachinesInstancesPageEventsTab';
import VirtualMachinesInstancesPageNetworkTab from '../tabs/network/VirtualMachinesInstancesPageNetworkTab';
import VirtualMachinesInstancesPageYAMLTab from '../tabs/yaml/VirtualMachinesInstancesPageYAMLTab';

const useVirtualMachinesInstancesTabs = () => {
  const { t } = useKubevirtTranslation();

  const tabs = React.useMemo(
    () => [
      {
        href: '',
        name: t('Details'),
        component: VirtualMachinesInstancesPageDetailsTab,
      },
      {
        href: 'yaml',
        name: t('YAML'),
        component: VirtualMachinesInstancesPageYAMLTab,
      },
      {
        href: 'console',
        name: t('Console'),
        component: VirtualMachinesInstancesPageConsoleTab,
      },
      {
        href: 'disks',
        name: t('Disks'),
        component: VirtualMachinesInstancesPageDisksTab,
      },
      {
        href: 'network',
        name: t('Network Interfaces'),
        component: VirtualMachinesInstancesPageNetworkTab,
      },
      {
        href: 'events',
        name: t('Events'),
        component: VirtualMachinesInstancesPageEventsTab,
      },
    ],
    [t],
  );

  return tabs;
};

export default useVirtualMachinesInstancesTabs;
