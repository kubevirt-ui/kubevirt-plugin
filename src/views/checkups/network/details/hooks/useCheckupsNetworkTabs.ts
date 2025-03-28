import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import CheckupsNetworkDetailsTab from '../tabs/details/CheckupsNetworkDetailsTab';
import CheckupsNetworkYAMLTab from '../tabs/yaml/CheckupsNetworkYAMLTab';

export const useCheckupsNetworkTabs = () => {
  const { t } = useKubevirtTranslation();

  return [
    {
      component: CheckupsNetworkDetailsTab,
      href: '',
      name: t('Details'),
    },
    {
      component: CheckupsNetworkYAMLTab,
      href: 'yaml',
      name: t('YAML'),
    },
  ];
};
