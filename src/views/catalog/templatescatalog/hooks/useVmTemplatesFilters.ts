import * as React from 'react';

import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';

type CountFilter = {
  value: Set<string>;
  count: number;
};

export type TemplateCountFilters = {
  support: CountFilter;
  osName: CountFilter;
  workload: CountFilter;
  flavor: CountFilter;
};

export type TemplateFilters = TemplateCountFilters & {
  onlyDefault: boolean;
  query: string;
};

export const useTemplatesFilters = (
  isAdmin: boolean,
): [TemplateFilters, (type: string, value: string) => void] => {
  const { params, appendParam, setParam, deleteParam } = useURLParams();
  const onlyDefaultParam = params.get('onlyDefault');

  const [onlyDefault, setOnlyDefault] = React.useState(isAdmin);
  const [query, setQuery] = React.useState(params.get('query') || '');
  const [filters, setFilters] = React.useState<TemplateCountFilters>({
    support: {
      count: 0,
      value: new Set([...params.getAll('support')]),
    },
    osName: {
      count: 0,
      value: new Set([...params.getAll('osName')]),
    },
    workload: {
      count: 0,
      value: new Set([...params.getAll('workload')]),
    },
    flavor: {
      count: 0,
      value: new Set([...params.getAll('flavor')]),
    },
  });

  const onSelect = (type: string, value: any) => {
    if (type === 'onlyDefault') {
      setOnlyDefault(value);
      setParam('onlyDefault', value.toString());
    } else if (type === 'query') {
      setQuery(value);
    } else {
      const filterSet = new Set<string>(filters?.[type]?.value);
      if (filterSet.has(value)) {
        filterSet.delete(value);
        deleteParam(type, value);
      } else {
        filterSet.add(value);
        appendParam(type, value);
      }

      setFilters({
        ...filters,
        [type]: {
          ...filters?.[type],
          value: filterSet,
        },
      });
    }
  };

  React.useEffect(() => {
    if (onlyDefaultParam) {
      setOnlyDefault(onlyDefaultParam === 'true');
    } else {
      setOnlyDefault(isAdmin);
      setParam('onlyDefault', isAdmin.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, onlyDefaultParam]);

  return [{ ...filters, onlyDefault, query }, onSelect];
};
