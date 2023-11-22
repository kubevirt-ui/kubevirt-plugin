import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateOS,
  isDefaultVariantTemplate,
  OS_NAMES,
} from '@kubevirt-utils/resources/template';
import { ItemsToFilterProps } from '@kubevirt-utils/utils/types';
import { getItemNameWithOther, includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getTemplateProviderName } from '../../utils/selectors';

const useTemplateProviders = (): ItemsToFilterProps[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      id: 'Red Hat',
      title: t('Red Hat'),
    },
    {
      id: 'Red Hat - Tech Preview',
      title: t('Red Hat - Tech Preview'),
    },
    {
      id: 'Other',
      title: t('Other'),
    },
  ];
};

const useVirtualMachineTemplatesFilters = (
  availableTemplatesUID: Set<string>,
): RowFilter<V1Template>[] => {
  const { t } = useKubevirtTranslation();
  const providers = useTemplateProviders();

  return [
    {
      filter: ({ selected }, obj) => selected?.length === 0 || isDefaultVariantTemplate(obj),
      filterGroupName: t('Type'),
      items: [
        {
          id: 'is-default',
          title: t('Default templates'),
        },
      ],
      reducer: (obj) => (isDefaultVariantTemplate(obj) ? 'is-default' : ''),
      type: 'is-default-template',
    },
    {
      filter: ({ selected }, obj) =>
        selected?.length === 0 || availableTemplatesUID.has(obj.metadata.uid),
      filterGroupName: t('Boot source'),
      items: [
        {
          id: 'available',
          title: t('Boot source available'),
        },
      ],
      reducer: (obj) => (availableTemplatesUID.has(obj.metadata.uid) ? 'available' : ''),
      type: 'boot-source-available',
    },
    {
      filter: (availableTemplateProviders, obj) =>
        includeFilter(availableTemplateProviders, providers, getTemplateProviderName(obj)),
      filterGroupName: t('Template provider'),
      items: providers,
      reducer: (obj) => getItemNameWithOther(getTemplateProviderName(obj), providers),
      type: 'template-provider',
    },
    {
      filter: (availableOsNames, obj) =>
        includeFilter(availableOsNames, OS_NAMES, getTemplateOS(obj)),
      filterGroupName: t('Operating system'),
      items: OS_NAMES,
      reducer: (obj) => getItemNameWithOther(getTemplateOS(obj), OS_NAMES),
      type: 'osName',
    },
  ];
};

export default useVirtualMachineTemplatesFilters;
