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
      filterGroupName: t('Type'),
      type: 'is-default-template',
      reducer: (obj) => (isDefaultVariantTemplate(obj) ? 'is-default' : ''),
      filter: ({ selected }, obj) => selected?.length === 0 || isDefaultVariantTemplate(obj),
      items: [
        {
          id: 'is-default',
          title: t('Default Templates'),
        },
      ],
    },
    {
      filterGroupName: t('Boot source'),
      type: 'boot-source-available',
      reducer: (obj) => (availableTemplatesUID.has(obj.metadata.uid) ? 'available' : ''),
      filter: ({ selected }, obj) =>
        selected?.length === 0 || availableTemplatesUID.has(obj.metadata.uid),
      items: [
        {
          id: 'available',
          title: t('Boot source available'),
        },
      ],
    },
    {
      filterGroupName: t('Template provider'),
      type: 'template-provider',
      reducer: (obj) => getItemNameWithOther(getTemplateProviderName(obj), providers),
      filter: (availableTemplateProviders, obj) =>
        includeFilter(availableTemplateProviders, providers, getTemplateProviderName(obj)),
      items: providers,
    },
    {
      filterGroupName: t('Operating system'),
      type: 'osName',
      reducer: (obj) => getItemNameWithOther(getTemplateOS(obj), OS_NAMES),
      filter: (availableOsNames, obj) =>
        includeFilter(availableOsNames, OS_NAMES, getTemplateOS(obj)),
      items: OS_NAMES,
    },
  ];
};

export default useVirtualMachineTemplatesFilters;
