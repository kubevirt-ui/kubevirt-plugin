import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { TabConfig } from '../../../utils/types';
import CheckupsStorageDetailsTab from '../tabs/details/CheckupsStorageDetailsTab';
import CheckupsStorageYAMLTab from '../tabs/yaml/CheckupsStorageYAMLTab';

export const useCheckupsStorageTabs = (): TabConfig[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      component: CheckupsStorageDetailsTab,
      href: '',
      name: t('Details'),
    },
    {
      component: CheckupsStorageYAMLTab,
      href: 'yaml',
      name: t('YAML'),
    },
  ];
};
