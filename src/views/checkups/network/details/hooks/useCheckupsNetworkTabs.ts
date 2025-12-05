import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { TabConfig } from '../../../utils/types';
import CheckupsNetworkDetailsTab from '../tabs/details/CheckupsNetworkDetailsTab';
import CheckupsNetworkYAMLTab from '../tabs/yaml/CheckupsNetworkYAMLTab';

export const useCheckupsNetworkTabs = (): TabConfig[] => {
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
