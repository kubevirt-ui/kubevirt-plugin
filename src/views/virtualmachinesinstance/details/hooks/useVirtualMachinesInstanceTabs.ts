import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import VirtualMachinesInstancePageConsoleTab from '../tabs/console/VirtualMachinesInstancePageConsoleTab';
import VirtualMachinesInstancePageDetailsTab from '../tabs/details/VirtualMachinesInstancePageDetailsTab';
import VirtualMachinesInstancePageDisksTab from '../tabs/disks/VirtualMachinesInstancePageDisksTab';
import VirtualMachinesInstancePageEventsTab from '../tabs/events/VirtualMachinesInstancePageEventsTab';
import VirtualMachinesInstancePageNetworkTab from '../tabs/network/VirtualMachinesInstancePageNetworkTab';
import VirtualMachinesInstancePageYAMLTab from '../tabs/yaml/VirtualMachinesInstancePageYAMLTab';

const useVirtualMachinesInstanceTabs = () => {
  const { t } = useKubevirtTranslation();

  const tabs = React.useMemo(
    () => [
      {
        href: '',
        name: t('Details'),
        component: VirtualMachinesInstancePageDetailsTab,
      },
      {
        href: 'yaml',
        name: t('YAML'),
        component: VirtualMachinesInstancePageYAMLTab,
      },
      {
        href: 'console',
        name: t('Console'),
        component: VirtualMachinesInstancePageConsoleTab,
      },
      {
        href: 'disks',
        name: t('Disks'),
        component: VirtualMachinesInstancePageDisksTab,
      },
      {
        href: 'network',
        name: t('Network Interfaces'),
        component: VirtualMachinesInstancePageNetworkTab,
      },
      {
        href: 'events',
        name: t('Events'),
        component: VirtualMachinesInstancePageEventsTab,
      },
    ],
    [t],
  );

  return tabs;
};

export default useVirtualMachinesInstanceTabs;
