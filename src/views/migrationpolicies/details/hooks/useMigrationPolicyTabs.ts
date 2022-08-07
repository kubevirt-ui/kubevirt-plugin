import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import MigrationPolicyDetailsPage from '../tabs/details/MigrationPolicyDetailsPage';
import MigrationPolicyYAMLPage from '../tabs/yaml/MigrationPolicyYAMLPage';

export const useMigrationPolicyTabs = () => {
  const { t } = useKubevirtTranslation();

  return [
    {
      href: '',
      name: t('Details'),
      component: MigrationPolicyDetailsPage,
    },
    {
      href: 'yaml',
      name: t('YAML'),
      component: MigrationPolicyYAMLPage,
    },
  ];
};
