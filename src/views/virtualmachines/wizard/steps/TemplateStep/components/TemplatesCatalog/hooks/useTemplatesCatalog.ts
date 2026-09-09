import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useClusterPreferencesByName from '@kubevirt-utils/hooks/useClusterPreferencesByName';
import useIsWindowsSupportedArchitecture from '@kubevirt-utils/hooks/useIsWindowsSupportedArchitecture';
import {
  type KubevirtFilter,
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { type ResourceMap } from '@kubevirt-utils/resources/shared';
import {
  OS_NAME_TYPES,
  type Template,
  type TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import { getTemplateOS } from '@kubevirt-utils/resources/template/utils/selectors';
import useVirtualMachineTemplatesFilters from '@templates/list/filters/useVirtualMachineTemplatesFilters';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import useTemplatesWithAvailableSource from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useTemplatesWithAvailableSource/useTemplatesWithAvailableSource';

import { buildOSDisplayNameMap } from '../../../utils/buildOSDisplayNameMap';
import useCatalogUIState from './useCatalogUIState';

type UseTemplatesCatalogReturn = {
  availableDataSources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  clearAll: () => void;
  clusterPreferencesByName: ResourceMap<V1beta1VirtualMachineClusterPreference>;
  filterDefinitions: KubevirtFilter<TemplateOrRequest>[];
  filteredTemplates: Template[];
  filters: KubevirtFilterState;
  isList: boolean;
  loaded: boolean;
  namespace: string;
  onSetFilters: OnSetFilters;
  osDisplayNames: Record<string, string>;
  setIsList: (value: boolean) => void;
  setNamespace: (value: string) => void;
};

const useTemplatesCatalog = (): UseTemplatesCatalogReturn => {
  const { control } = useVMWizard();
  const cluster = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER });
  const { isList, namespace, setIsList, setNamespace } = useCatalogUIState();

  const { availableDataSources, availableTemplatesUID, bootSourcesLoaded, loaded, templates } =
    useTemplatesWithAvailableSource({ clusterOverride: cluster, namespace });

  const clusterPreferencesByName = useClusterPreferencesByName(cluster);

  const osDisplayNames = useMemo(() => buildOSDisplayNameMap(templates), [templates]);

  const isWindowsSupported = useIsWindowsSupportedArchitecture(cluster);

  const supportedTemplates = useMemo(
    () =>
      isWindowsSupported
        ? templates
        : templates.filter((t) => getTemplateOS(t) !== OS_NAME_TYPES.Windows),
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
    clusterPreferencesByName,
    filterDefinitions,
    filteredTemplates: filteredData,
    filters,
    isList,
    loaded,
    namespace,
    onSetFilters,
    osDisplayNames,
    setIsList,
    setNamespace,
  };
};

export default useTemplatesCatalog;
