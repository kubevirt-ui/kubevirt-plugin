import { useMemo } from 'react';

import useIsWindowsSupportedArchitecture from '@kubevirt-utils/hooks/useIsWindowsSupportedArchitecture';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { OS_NAME_TYPES, type Template } from '@kubevirt-utils/resources/template';
import { getTemplateOS } from '@kubevirt-utils/resources/template/utils/selectors';
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

  const filterDefinitions = useVirtualMachineTemplatesFilters(supportedTemplates);

  const { clearAllFilters, filteredData, filters, onSetFilters } =
    useKubevirtDataViewFilters<Template>({
      data: supportedTemplates,
      filterDefinitions,
    });

  return {
    availableDataSources,
    availableTemplatesUID,
    bootSourcesLoaded,
    clearAll: clearAllFilters,
    filterDefinitions,
    filteredTemplates: filteredData,
    filters,
    isList,
    loaded,
    namespace,
    onSetFilters,
    setIsList,
    setNamespace,
  };
};

export default useTemplatesCatalog;
