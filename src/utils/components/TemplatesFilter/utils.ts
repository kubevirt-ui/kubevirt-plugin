import { type TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { type RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { TemplateFilterType } from '@templates/list/filters/types';

type SplitTemplateFilters = {
  commonFilters: RowFilter<TemplateOrRequest>[];
  openShiftTemplatesOnlyFilters: RowFilter<TemplateOrRequest>[];
  scopeFilter: RowFilter<TemplateOrRequest> | undefined;
};

const splitTemplateFilters = (rowFilters: RowFilter<TemplateOrRequest>[]): SplitTemplateFilters => {
  const getRowFilter = (type: TemplateFilterType): RowFilter<TemplateOrRequest> | undefined =>
    rowFilters.find((filter) => filter.type === type);

  // Type filter is rendered as TemplatesTypeToggle outside the Filter dropdown.
  const commonFilters = [TemplateFilterType.Architecture].map(getRowFilter).filter(Boolean);

  const openShiftTemplatesOnlyFilters = [TemplateFilterType.Provider, TemplateFilterType.OSName]
    .map(getRowFilter)
    .filter(Boolean);

  const scopeFilter = getRowFilter(TemplateFilterType.TemplateScope);

  return { commonFilters, openShiftTemplatesOnlyFilters, scopeFilter };
};

export default splitTemplateFilters;
