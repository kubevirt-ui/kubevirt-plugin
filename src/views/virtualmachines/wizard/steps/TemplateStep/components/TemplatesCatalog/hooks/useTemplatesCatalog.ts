import { useCallback, useMemo } from 'react';

import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import useFiltersFromURL from '@kubevirt-utils/hooks/useFiltersFromURL';
import useIsWindowsSupportedArchitecture from '@kubevirt-utils/hooks/useIsWindowsSupportedArchitecture';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { getTemplateOS } from '@kubevirt-utils/resources/template/utils/selectors';
import { useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { getRowFilterQueryKey } from '@search/utils/query';
import useVirtualMachineTemplatesFilters from '@templates/list/filters/useVirtualMachineTemplatesFilters';
import useTemplatesWithAvailableSource from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useTemplatesWithAvailableSource/useTemplatesWithAvailableSource';

import useCatalogUIState from './useCatalogUIState';

const useTemplatesCatalog = () => {
  const { isList, namespace, setIsList, setNamespace } = useCatalogUIState();

  const { availableDataSources, availableTemplatesUID, bootSourcesLoaded, loaded, templates } =
    useTemplatesWithAvailableSource({ namespace });

  const isWindowsSupported = useIsWindowsSupportedArchitecture();

  const supportedTemplates = useMemo(
    () =>
      isWindowsSupported
        ? templates
        : templates.filter((t) => getTemplateOS(t) !== OS_NAME_TYPES.windows),
    [templates, isWindowsSupported],
  );

  const { filters } = useVirtualMachineTemplatesFilters(supportedTemplates);
  const filtersFromURL = useFiltersFromURL(filters);
  const [, filteredTemplates, onFilterChange] = useListPageFilter(
    supportedTemplates,
    filters,
    filtersFromURL,
  );

  const { removeQueryArguments } = useQueryParamsMethods();

  const clearAll = useCallback(() => {
    const filterKeys = filters.map((rf) => getRowFilterQueryKey(rf.type));

    removeQueryArguments(...filterKeys, getRowFilterQueryKey('name'));
  }, [filters, removeQueryArguments]);

  return {
    availableDataSources,
    availableTemplatesUID,
    bootSourcesLoaded,
    clearAll,
    filteredTemplates,
    filters,
    isList,
    loaded,
    namespace,
    onFilterChange,
    setIsList,
    setNamespace,
  };
};

export default useTemplatesCatalog;
