import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import CheckupsSelfValidationDetailsTab from '../tabs/details/CheckupsSelfValidationDetailsTab';
import CheckupsSelfValidationYAMLTab from '../tabs/yaml/CheckupsSelfValidationYAMLTab';

export const useCheckupsSelfValidationTabs = () => {
  const { t } = useKubevirtTranslation();

  return [
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
  ];
};
