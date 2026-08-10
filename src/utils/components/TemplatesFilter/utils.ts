import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { type TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { TEMPLATE_TYPE_ID } from '@templates/list/filters/constants';
import { TemplateFilterType } from '@templates/list/filters/types';

import { type UniversalFilter } from '../../hooks/useUniversalFilter/useUniversalFilter';

type SplitTemplateFilters = {
  categoryFilter: KubevirtFilter<TemplateOrRequest> | undefined;
  commonFilters: KubevirtFilter<TemplateOrRequest>[];
  openShiftTemplatesOnlyFilters: KubevirtFilter<TemplateOrRequest>[];
  scopeFilter: KubevirtFilter<TemplateOrRequest> | undefined;
  typeFilter: KubevirtFilter<TemplateOrRequest> | undefined;
};

export type TemplateTypeSelectionState = {
  /** Effective selection: missing Type query means both are selected (All). */
  isOpenShiftTypeSelected: boolean;
  isVirtualMachineTypeSelected: boolean;
  noTypeSelected: boolean;
  showOpenShiftFilters: boolean;
  showVirtualMachineFilters: boolean;
};

/**
 * Derives Type checkbox selection and which filter sections to show.
 * Missing Type in the query means both kinds are selected (All).
 */
export const getTemplateTypeSelectionStateFromFilter = ({
  hasQueryKey,
  isSelected,
}: Pick<UniversalFilter, 'hasQueryKey' | 'isSelected'>): TemplateTypeSelectionState => {
  const noTypeSelected = !hasQueryKey(TemplateFilterType.Type);
  const isOpenShiftTypeSelected =
    noTypeSelected || isSelected(TemplateFilterType.Type, TEMPLATE_TYPE_ID.OPENSHIFT);
  const isVirtualMachineTypeSelected =
    noTypeSelected || isSelected(TemplateFilterType.Type, TEMPLATE_TYPE_ID.VM);

  const showOnlyOpenShift = isOpenShiftTypeSelected && !isVirtualMachineTypeSelected;
  const showOnlyVirtualMachine = isVirtualMachineTypeSelected && !isOpenShiftTypeSelected;
  const showBothTemplateKinds = isOpenShiftTypeSelected && isVirtualMachineTypeSelected;

  return {
    isOpenShiftTypeSelected,
    isVirtualMachineTypeSelected,
    noTypeSelected,
    showOpenShiftFilters: showOnlyOpenShift || showBothTemplateKinds,
    showVirtualMachineFilters: showOnlyVirtualMachine || showBothTemplateKinds,
  };
};

const splitTemplateFilters = (
  filterDefinitions: KubevirtFilter<TemplateOrRequest>[],
): SplitTemplateFilters => {
  const getFilter = (filterId: TemplateFilterType): KubevirtFilter<TemplateOrRequest> | undefined =>
    filterDefinitions.find((filter) => filter.id === filterId);

  const typeFilter = getFilter(TemplateFilterType.Type);
  // Architecture + OS apply to both template kinds; Provider is OpenShift-only.
  const commonFilters = [TemplateFilterType.Architecture, TemplateFilterType.OSName]
    .map(getFilter)
    .filter(Boolean);

  const openShiftTemplatesOnlyFilters = [TemplateFilterType.Provider]
    .map(getFilter)
    .filter(Boolean);

  const scopeFilter = getFilter(TemplateFilterType.TemplateScope);
  const categoryFilter = getFilter(TemplateFilterType.Category);

  return {
    categoryFilter,
    commonFilters,
    openShiftTemplatesOnlyFilters,
    scopeFilter,
    typeFilter,
  };
};

export default splitTemplateFilters;
