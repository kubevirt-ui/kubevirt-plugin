import React, { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import CheckupsSelfValidationDetailsTab from '../tabs/details/CheckupsSelfValidationDetailsTab';
import CheckupsSelfValidationYAMLTab from '../tabs/yaml/CheckupsSelfValidationYAMLTab';

type CheckupsSelfValidationTab = {
  component: React.ComponentType;
  href: string;
  name: string;
};

export const useCheckupsSelfValidationTabs = (): CheckupsSelfValidationTab[] => {
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
