import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';

import { CATALOG_FILTERS } from './consts';

export type TemplateFilters = {
  [CATALOG_FILTERS.ALL_ITEMS]: boolean;
  [CATALOG_FILTERS.ARCHITECTURE]: Set<string>;
  [CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES]: boolean;
  [CATALOG_FILTERS.IS_LIST]: boolean;
  [CATALOG_FILTERS.NAMESPACE]: string;
  [CATALOG_FILTERS.ONLY_AVAILABLE]: boolean;
  [CATALOG_FILTERS.ONLY_DEFAULT]: boolean;
  [CATALOG_FILTERS.ONLY_USER]: boolean;
  [CATALOG_FILTERS.OS_NAME]: Set<string>;
  [CATALOG_FILTERS.QUERY]: string;
  [CATALOG_FILTERS.WORKLOAD]: Set<string>;
};

export type TemplatesCatalogCallbacks = {
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  onTemplateClick: (template: V1Template) => void;
  selectedTemplate?: V1Template;
};
