import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import TemplateDetailsPage from '../tabs/details/TemplateDetailsPage';
import TemplateDisksPage from '../tabs/disks/TemplateDisksPage';
import TemplateNetworkPage from '../tabs/network/TemplateNetworkPage';
import TemplateParametersPage from '../tabs/parameters/TemplateParametersPage';
import TemplateSchedulingTab from '../tabs/scheduling/TemplateSchedulingTab';
import TemplateScriptsPage from '../tabs/scripts/TemplateScriptsPage';
import TemplateYAMLPage from '../tabs/yaml/TemplateYAMLPage';

export const useVirtualMachineTabs = () => {
  const { t } = useKubevirtTranslation();

  const tabs = [
    {
      component: TemplateDetailsPage,
      href: '',
      name: t('Details'),
    },
    {
      component: TemplateYAMLPage,
      href: 'yaml',
      name: 'YAML',
    },
    {
      component: TemplateSchedulingTab,
      href: 'scheduling',
      name: t('Scheduling'),
    },
    {
      component: TemplateNetworkPage,
      href: 'network-interfaces',
      name: t('Network interfaces'),
    },
    {
      component: TemplateDisksPage,
      href: 'disks',
      name: t('Disks'),
    },
    {
      component: TemplateScriptsPage,
      href: 'scripts',
      name: t('Scripts'),
    },
    {
      component: TemplateParametersPage,
      href: 'parameters',
      name: t('Parameters'),
    },
  ];

  return tabs;
};
