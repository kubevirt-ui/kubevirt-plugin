import * as React from 'react';

import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';

import { CATALOG_FILTERS } from '../utils/consts';

export type TemplateFilters = {
  [CATALOG_FILTERS.IS_LIST]: boolean;
  [CATALOG_FILTERS.NAMESPACE]: string;
  [CATALOG_FILTERS.ONLY_AVAILABLE]: boolean;
  [CATALOG_FILTERS.ONLY_DEFAULT]: boolean;
  [CATALOG_FILTERS.OS_NAME]: Set<string>;
  [CATALOG_FILTERS.QUERY]: string;
  [CATALOG_FILTERS.WORKLOAD]: Set<string>;
};

export const useTemplatesFilters = (): [
  TemplateFilters,
  (type: CATALOG_FILTERS, value: boolean | string) => void,
  () => void,
] => {
  const { appendParam, deleteParam, params, setParam } = useURLParams();
  const onlyDefaultParam = params.get(CATALOG_FILTERS.ONLY_DEFAULT);

  const [filters, setFilters] = React.useState<TemplateFilters>({
    [CATALOG_FILTERS.IS_LIST]: params.get(CATALOG_FILTERS.IS_LIST) === 'true',
    [CATALOG_FILTERS.NAMESPACE]: params.get(CATALOG_FILTERS.NAMESPACE) || '',
    [CATALOG_FILTERS.ONLY_AVAILABLE]: params.get(CATALOG_FILTERS.ONLY_AVAILABLE) === 'true',
    [CATALOG_FILTERS.ONLY_DEFAULT]: true,
    [CATALOG_FILTERS.OS_NAME]: new Set([...params.getAll(CATALOG_FILTERS.OS_NAME)]),
    [CATALOG_FILTERS.QUERY]: params.get(CATALOG_FILTERS.QUERY) || '',
    [CATALOG_FILTERS.WORKLOAD]: new Set([...params.getAll(CATALOG_FILTERS.WORKLOAD)]),
  });

  const updateFilter = (type: CATALOG_FILTERS, value: boolean | string) =>
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));

  const onFilterChange = (type: CATALOG_FILTERS, value: any) => {
    switch (type) {
      case CATALOG_FILTERS.ONLY_DEFAULT:
      case CATALOG_FILTERS.ONLY_AVAILABLE:
      case CATALOG_FILTERS.IS_LIST:
      case CATALOG_FILTERS.NAMESPACE:
      case CATALOG_FILTERS.QUERY:
        {
          updateFilter(type, value);
          setParam(type, value.toString());
        }
        break;

      default: {
        const filterSet = new Set<string>(filters?.[type]);
        if (filterSet.has(value)) {
          filterSet.delete(value);
          deleteParam(type, value);
        } else {
          filterSet.add(value);
          appendParam(type, value);
        }

        setFilters({
          ...filters,
          [type]: filterSet,
        });
      }
    }
  };

  const clearAll = () => {
    setFilters({
      [CATALOG_FILTERS.IS_LIST]: filters.isList,
      [CATALOG_FILTERS.NAMESPACE]: '',
      [CATALOG_FILTERS.ONLY_AVAILABLE]: false,
      [CATALOG_FILTERS.ONLY_DEFAULT]: true,
      [CATALOG_FILTERS.OS_NAME]: new Set(),
      [CATALOG_FILTERS.QUERY]: '',
      [CATALOG_FILTERS.WORKLOAD]: new Set(),
    });
    Object.keys(filters).forEach((key) => {
      deleteParam(key);
    });
  };

  React.useEffect(() => {
    if (onlyDefaultParam) {
      updateFilter(CATALOG_FILTERS.ONLY_DEFAULT, onlyDefaultParam === 'true');
    } else {
      updateFilter(CATALOG_FILTERS.ONLY_DEFAULT, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyDefaultParam]);

  return [filters, onFilterChange, clearAll];
};
