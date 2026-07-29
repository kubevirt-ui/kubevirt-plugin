import { type UniversalFilter } from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { type TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { type RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { TEMPLATE_TYPE_ID } from '@templates/list/filters/constants';
import { TemplateFilterType } from '@templates/list/filters/types';

type SplitTemplateFilters = {
  categoryFilter: RowFilter<TemplateOrRequest> | undefined;
  commonFilters: RowFilter<TemplateOrRequest>[];
  openShiftTemplatesOnlyFilters: RowFilter<TemplateOrRequest>[];
  scopeFilter: RowFilter<TemplateOrRequest> | undefined;
  typeFilter: RowFilter<TemplateOrRequest> | undefined;
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
 * @param root0
 * @param root0.hasQueryKey
 * @param root0.isSelected
 * @param root0.vmTemplatesEnabled
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

const splitTemplateFilters = (rowFilters: RowFilter<TemplateOrRequest>[]): SplitTemplateFilters => {
  const getRowFilter = (type: TemplateFilterType): RowFilter<TemplateOrRequest> | undefined =>
    rowFilters.find((filter) => filter.type === type);

  const typeFilter = getRowFilter(TemplateFilterType.Type);
  // Architecture + OS apply to both template kinds; Provider is OpenShift-only.
  const commonFilters = [TemplateFilterType.Architecture, TemplateFilterType.OSName]
    .map(getRowFilter)
    .filter(Boolean);

  const openShiftTemplatesOnlyFilters = [TemplateFilterType.Provider]
    .map(getRowFilter)
    .filter(Boolean);

  const scopeFilter = getRowFilter(TemplateFilterType.TemplateScope);
  const categoryFilter = getRowFilter(TemplateFilterType.Category);

  return {
    categoryFilter,
    commonFilters,
    openShiftTemplatesOnlyFilters,
    scopeFilter,
    typeFilter,
  };
};

export default splitTemplateFilters;
