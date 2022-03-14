import * as React from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';

export type TemplateFilters = {
  onlyDefault: boolean;
  onlyAvailable: boolean;
  query: string;
  osName: Set<string>;
  workload: Set<string>;
};

export const useTemplatesFilters = (): [
  TemplateFilters,
  (type: string, value: string) => void,
  () => void,
] => {
  const [isAdmin] = useIsAdmin();
  const { params, appendParam, setParam, deleteParam } = useURLParams();
  const onlyDefaultParam = params.get('onlyDefault');

  const [filters, setFilters] = React.useState<TemplateFilters>({
    onlyDefault: isAdmin,
    onlyAvailable: params.get('onlyAvailable') === 'true',
    query: params.get('query') || '',
    osName: new Set([...params.getAll('osName')]),
    workload: new Set([...params.getAll('workload')]),
  });

  const updateFilter = (type: string, value: string | boolean) =>
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));

  const onSelect = (type: string, value: any) => {
    switch (type) {
      case 'onlyDefault':
        {
          updateFilter('onlyDefault', value);
          setParam('onlyDefault', value.toString());
        }
        break;
      case 'onlyAvailable':
        {
          updateFilter('onlyAvailable', value);
          setParam('onlyAvailable', value.toString());
        }
        break;
      case 'query':
        updateFilter('query', value);
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
      onlyDefault: isAdmin,
      onlyAvailable: false,
      query: '',
      osName: new Set(),
      workload: new Set(),
    });
    Object.keys(filters).forEach((key) => {
      deleteParam(key);
    });
  };

  React.useEffect(() => {
    if (onlyDefaultParam) {
      updateFilter('onlyDefault', onlyDefaultParam === 'true');
    } else {
      updateFilter('onlyDefault', isAdmin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, onlyDefaultParam]);

  return [filters, onSelect, clearAll];
};
