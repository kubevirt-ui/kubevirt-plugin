import { TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { TemplateFilterType } from '@templates/list/filters/types';

const splitTemplateFilters = (rowFilters: RowFilter<TemplateOrRequest>[]) => {
  const getRowFilter = (type: TemplateFilterType) => rowFilters.find((f) => f.type === type);

  const commonFilters = [TemplateFilterType.Type, TemplateFilterType.Architecture]
    .map(getRowFilter)
    .filter(Boolean);

  const openShiftTemplatesOnlyFilters = [TemplateFilterType.Provider, TemplateFilterType.OSName]
    .map(getRowFilter)
    .filter(Boolean);

  const scopeFilter = getRowFilter(TemplateFilterType.TemplateScope);

  return { commonFilters, openShiftTemplatesOnlyFilters, scopeFilter };
};

export default splitTemplateFilters;
