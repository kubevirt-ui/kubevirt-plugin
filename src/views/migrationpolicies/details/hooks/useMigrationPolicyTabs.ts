import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import MigrationPolicyDetailsPage from '../tabs/details/MigrationPolicyDetailsPage';
import MigrationPolicyYAMLPage from '../tabs/yaml/MigrationPolicyYAMLPage';

export const useMigrationPolicyTabs = () => {
  const { t } = useKubevirtTranslation();

  return [
    {
      component: MigrationPolicyDetailsPage,
      href: '',
      name: t('Details'),
    },
    {
      component: MigrationPolicyYAMLPage,
      href: 'yaml',
      name: t('YAML'),
    },
  ];
};
