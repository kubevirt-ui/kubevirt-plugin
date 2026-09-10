import { useMemo } from 'react';
import { type TabConfig } from 'src/views/checkups/utils/types';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import MigrationPolicyDetailsPage from '../tabs/details/MigrationPolicyDetailsPage';
import MigrationPolicyYAMLPage from '../tabs/yaml/MigrationPolicyYAMLPage';

export const useMigrationPolicyTabs = (): TabConfig[] => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => [
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
    ],
    [t],
  );
};
