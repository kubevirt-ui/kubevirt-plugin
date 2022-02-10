import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import { FilterValue, RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getTemplateProviderName } from '../../utils/selectors';

type TemplateProviderProps = {
  id: string;
  title: string;
};

const useTemplateProviders = (): TemplateProviderProps[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      id: 'Red Hat',
      title: 'Red Hat',
    },
    {
      id: 'Other',
      title: t('Other'),
    },
  ];
};

// return VM template provider name or 'Other' if the provider name not included in the array of providers available for filtering
const getTemplateProviderNameWithOther = (template: V1Template, templateProviders): string => {
  const providerName = getTemplateProviderName(template);

  return !templateProviders?.find((s: TemplateProviderProps) => s.id === providerName) ||
    providerName === 'Other'
    ? 'Other'
    : providerName;
};

const includeFilter = (
  compareData: FilterValue,
  providers: TemplateProviderProps[],
  template: V1Template,
): boolean => {
  const compareString = getTemplateProviderNameWithOther(template, providers);

  return compareData.selected?.length === 0 || compareData.selected?.includes(compareString);
};

const useVirtualMachineTemplatesFilters = (): RowFilter[] => {
  const { t } = useKubevirtTranslation();
  const providers = useTemplateProviders();

  return [
    {
      filterGroupName: t('Template provider'),
      type: 'template-provider',
      reducer: (obj) => getTemplateProviderNameWithOther(obj, providers),
      filter: (availableTemplateProviders, obj) =>
        includeFilter(availableTemplateProviders, providers, obj),
      items: providers,
    },
  ];
};

export default useVirtualMachineTemplatesFilters;
