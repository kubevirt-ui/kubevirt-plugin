import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import TemplateDetailsPage from '../tabs/details/TemplateDetailsPage';
import TemplateDisksPage from '../tabs/disks/TemplateDisksPage';
import TemplateNetworkPage from '../tabs/network/TemplateNetworkPage';
import TemplateParametersPage from '../tabs/parameters/TemplateParametersPage';
import TemplateSchedulingTab from '../tabs/scheduling/TemplateSchedulingTab';
import TemplateScriptsPage from '../tabs/scripts/TemplateYAMLPage';
import TemplateYAMLPage from '../tabs/yaml/TemplateYAMLPage';

export const useVirtualMachineTabs = () => {
  const { t } = useKubevirtTranslation();

  const tabs = React.useMemo(
    () => [
      {
        href: '',
        name: t('Details'),
        component: TemplateDetailsPage,
      },
      {
        href: 'yaml',
        name: 'YAML',
        component: TemplateYAMLPage,
      },
      {
        href: 'scheduling',
        name: t('Scheduling'),
        component: TemplateSchedulingTab,
      },
      {
        href: 'network-interfaces',
        name: t('Network Interfaces'),
        component: TemplateNetworkPage,
      },
      {
        href: 'disks',
        name: t('Disks'),
        component: TemplateDisksPage,
      },
      {
        href: 'scripts',
        name: t('Scripts'),
        component: TemplateScriptsPage,
      },
      {
        href: 'parameters',
        name: t('Parameters'),
        component: TemplateParametersPage,
      },
    ],
    [t],
  );

  return tabs;
};
