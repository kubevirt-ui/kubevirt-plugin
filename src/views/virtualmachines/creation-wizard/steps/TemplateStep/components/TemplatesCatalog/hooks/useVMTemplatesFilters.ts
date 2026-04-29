import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';

import { CATALOG_FILTERS } from '../utils/consts';
import { TemplateFilters } from '../utils/types';

export const useTemplatesFilters = (): [
  TemplateFilters,
  (type: CATALOG_FILTERS, value: boolean | string) => void,
  () => void,
] => {
  // replace: true uses history.replaceState instead of pushState for every filter change. Firefox caps pushState at 50/10s and throws SecurityError when exceeded.
  const { appendParam, deleteParam, params, setParam } = useURLParams({ replace: true });
  const location = useLocation();
  const navigate = useNavigate();
  const onlyDefaultParam = params.get(CATALOG_FILTERS.ONLY_DEFAULT);
  const onlyDefaultParamIsTrue = onlyDefaultParam === 'true';
  const onlyUserParamIsTrue = params.get(CATALOG_FILTERS.ONLY_USER) === 'true';

  const hasNoDefaultUserAllParams =
    onlyDefaultParamIsTrue &&
    onlyUserParamIsTrue &&
    params.get(CATALOG_FILTERS.ALL_ITEMS) === 'true'; // has none of these params when accessing catalog for the first time

  const [filters, setFilters] = useState<TemplateFilters>({
    [CATALOG_FILTERS.ALL_ITEMS]: params.get(CATALOG_FILTERS.ONLY_DEFAULT) === 'false',
    [CATALOG_FILTERS.ARCHITECTURE]: new Set([...params.getAll(CATALOG_FILTERS.ARCHITECTURE)]),
    [CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES]:
      params.get(CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES) === 'true',
    [CATALOG_FILTERS.IS_LIST]: params.get(CATALOG_FILTERS.IS_LIST) === 'true',
    [CATALOG_FILTERS.NAMESPACE]: params.get(CATALOG_FILTERS.NAMESPACE) || '',
    [CATALOG_FILTERS.ONLY_AVAILABLE]: params.get(CATALOG_FILTERS.ONLY_AVAILABLE) === 'true',
    [CATALOG_FILTERS.ONLY_DEFAULT]: onlyDefaultParamIsTrue || hasNoDefaultUserAllParams,
    [CATALOG_FILTERS.ONLY_USER]: onlyUserParamIsTrue,
    [CATALOG_FILTERS.OS_NAME]: new Set([...params.getAll(CATALOG_FILTERS.OS_NAME)]),
    [CATALOG_FILTERS.QUERY]: params.get(CATALOG_FILTERS.QUERY) || '',
    [CATALOG_FILTERS.WORKLOAD]: new Set([...params.getAll(CATALOG_FILTERS.WORKLOAD)]),
  });

  const updateFilter = (type: CATALOG_FILTERS, value: boolean | string) =>
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));

  const updateFilterAndSetParam = (type: CATALOG_FILTERS, value: boolean | string) => {
    updateFilter(type, value);
    setParam(type, value.toString());
  };

  const onFilterChange = (type: CATALOG_FILTERS, value: any) => {
    switch (type) {
      case CATALOG_FILTERS.ALL_ITEMS:
        {
          updateFilter(type, value);
          setParam(CATALOG_FILTERS.ONLY_DEFAULT, 'false');

          updateFilter(CATALOG_FILTERS.ONLY_USER, false);
          updateFilter(CATALOG_FILTERS.ONLY_DEFAULT, false);
          deleteParam(CATALOG_FILTERS.ONLY_USER);
        }
        break;
      case CATALOG_FILTERS.ONLY_DEFAULT:
        {
          updateFilterAndSetParam(type, value);

          updateFilter(CATALOG_FILTERS.ALL_ITEMS, false);
          updateFilter(CATALOG_FILTERS.ONLY_USER, false);
          deleteParam(CATALOG_FILTERS.ONLY_USER);
        }
        break;
      case CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES:
      case CATALOG_FILTERS.ONLY_AVAILABLE:
      case CATALOG_FILTERS.IS_LIST:
      case CATALOG_FILTERS.NAMESPACE:
      case CATALOG_FILTERS.QUERY:
        updateFilterAndSetParam(type, value);
        break;

      case CATALOG_FILTERS.ONLY_USER:
        {
          updateFilterAndSetParam(type, value);

          updateFilter(CATALOG_FILTERS.ALL_ITEMS, false);
          updateFilter(CATALOG_FILTERS.ONLY_DEFAULT, false);
          deleteParam(CATALOG_FILTERS.ONLY_DEFAULT);
        }
        break;

      default: {
        const isSelected = (filters?.[type] as Set<string>)?.has(value);
        if (isSelected) {
          deleteParam(type, value);
        } else {
          appendParam(type, value);
        }
        setFilters((prev) => {
          const filterSet = new Set<string>(prev?.[type] as Set<string>);
          isSelected ? filterSet.delete(value) : filterSet.add(value);
          return { ...prev, [type]: filterSet };
        });
      }
    }
  };

  const clearAll = () => {
    setFilters({
      [CATALOG_FILTERS.ALL_ITEMS]: false,
      [CATALOG_FILTERS.ARCHITECTURE]: new Set(),
      [CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES]: true,
      [CATALOG_FILTERS.IS_LIST]: filters.isList,
      [CATALOG_FILTERS.NAMESPACE]: '',
      [CATALOG_FILTERS.ONLY_AVAILABLE]: false,
      [CATALOG_FILTERS.ONLY_DEFAULT]: true,
      [CATALOG_FILTERS.ONLY_USER]: false,
      [CATALOG_FILTERS.OS_NAME]: new Set(),
      [CATALOG_FILTERS.QUERY]: '',
      [CATALOG_FILTERS.WORKLOAD]: new Set(),
    });

    const newParams = new URLSearchParams(location.search);
    Object.values(CATALOG_FILTERS).forEach((key) => newParams.delete(key));
    navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
  };

  useEffect(() => {
    onlyDefaultParam && updateFilter(CATALOG_FILTERS.ONLY_DEFAULT, onlyDefaultParamIsTrue);
  }, [hasNoDefaultUserAllParams, onlyDefaultParam, onlyDefaultParamIsTrue]);

  return [filters, onFilterChange, clearAll];
};
