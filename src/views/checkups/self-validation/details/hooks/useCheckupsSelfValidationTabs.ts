import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { TabConfig } from '../../../utils/types';
import CheckupsSelfValidationDetailsTab from '../tabs/details/CheckupsSelfValidationDetailsTab';
import CheckupsSelfValidationYAMLTab from '../tabs/yaml/CheckupsSelfValidationYAMLTab';

export const useCheckupsSelfValidationTabs = (): TabConfig[] => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => [
      {
        component: CheckupsSelfValidationDetailsTab,
        href: '',
        name: t('Details'),
      },
      {
        component: CheckupsSelfValidationYAMLTab,
        href: 'yaml',
        name: t('YAML'),
      },
    ],
    [t],
  );
};
