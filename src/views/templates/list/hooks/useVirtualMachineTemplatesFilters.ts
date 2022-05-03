import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateOS,
  isDefaultVariantTemplate,
  OS_NAME_TYPES,
  OS_NAMES,
} from '@kubevirt-utils/resources/template';
import { FilterValue, RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getTemplateProviderName } from '../../utils/selectors';

type ItemsToFilterProps = {
  id: string;
  title: string;
};

const useTemplateProviders = (): ItemsToFilterProps[] => {
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

// return the name (of VM template provider/OS) or 'Other' if the name not included in the array of available items for filtering
const getItemNameWithOther = (itemName: string, items: ItemsToFilterProps[]): string =>
  !items?.find((s: ItemsToFilterProps) => s.id === itemName) || itemName === 'Other'
    ? 'Other'
    : itemName;

const includeFilter = (
  compareData: FilterValue,
  items: ItemsToFilterProps[],
  itemName: string,
): boolean => {
  const compareString = getItemNameWithOther(itemName, items);

  return compareData.selected?.length === 0 || compareData.selected?.includes(compareString);
};

const useVirtualMachineTemplatesFilters = (
  availableTemplatesUID: Set<string>,
): RowFilter<V1Template>[] => {
  const { t } = useKubevirtTranslation();
  const providers = useTemplateProviders();
  const osNames = [
    ...OS_NAMES,
    {
      id: OS_NAME_TYPES.other,
      title: t('Other'),
    },
  ];

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
      filterGroupName: t('OS'),
      type: 'osName',
      reducer: (obj) => getItemNameWithOther(getTemplateOS(obj), osNames),
      filter: (availableOsNames, obj) =>
        includeFilter(availableOsNames, osNames, getTemplateOS(obj)),
      items: osNames,
    },
  ];
};

export default useVirtualMachineTemplatesFilters;
