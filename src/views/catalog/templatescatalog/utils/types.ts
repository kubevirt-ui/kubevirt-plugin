import { CATALOG_FILTERS } from './consts';

export type TemplateFilters = {
  [CATALOG_FILTERS.IS_LIST]: boolean;
  [CATALOG_FILTERS.NAMESPACE]: string;
  [CATALOG_FILTERS.ONLY_AVAILABLE]: boolean;
  [CATALOG_FILTERS.ONLY_DEFAULT]: boolean;
  [CATALOG_FILTERS.ONLY_USER]: boolean;
  [CATALOG_FILTERS.OS_NAME]: Set<string>;
  [CATALOG_FILTERS.QUERY]: string;
  [CATALOG_FILTERS.WORKLOAD]: Set<string>;
};
