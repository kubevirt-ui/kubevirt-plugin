import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import VirtualMachinesInstancePageConsoleTab from '../tabs/console/VirtualMachinesInstancePageConsoleTab';
import VirtualMachinesInstancePageDetailsTab from '../tabs/details/VirtualMachinesInstancePageDetailsTab';
import VirtualMachinesInstancePageDisksTab from '../tabs/disks/VirtualMachinesInstancePageDisksTab';
import VirtualMachinesInstancePageEventsTab from '../tabs/events/VirtualMachinesInstancePageEventsTab';
import VirtualMachinesInstancePageNetworkTab from '../tabs/network/VirtualMachinesInstancePageNetworkTab';
import VirtualMachinesInstancePageSchedulingTab from '../tabs/scheduling/VirtualMachinesInstancePageSchedulingTab';
import VirtualMachinesInstancePageYAMLTab from '../tabs/yaml/VirtualMachinesInstancePageYAMLTab';

const useVirtualMachinesInstanceTabs = () => {
  const { t } = useKubevirtTranslation();

  const tabs = [
    {
      component: VirtualMachinesInstancePageDetailsTab,
      href: '',
      name: t('Details'),
    },
    {
      component: VirtualMachinesInstancePageYAMLTab,
      href: 'yaml',
      name: t('YAML'),
    },
    {
      component: VirtualMachinesInstancePageSchedulingTab,
      href: 'scheduling',
      name: t('Scheduling'),
    },
    {
      component: VirtualMachinesInstancePageEventsTab,
      href: 'events',
      name: t('Events'),
    },
    {
      component: VirtualMachinesInstancePageConsoleTab,
      href: 'console',
      name: t('Console'),
    },
    {
      component: VirtualMachinesInstancePageNetworkTab,
      href: 'network',
      name: t('Network interfaces'),
    },
    {
      component: VirtualMachinesInstancePageDisksTab,
      href: 'disks',
      name: t('Disks'),
    },
  ];

  return tabs;
};

export default useVirtualMachinesInstanceTabs;
