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
  tabView: 'all' | 'onlyDefault' | 'onlyAvailable';
  query: string;
};

export const useTemplatesFilters = (): [
  TemplateFilters,
  (type: string, value: string) => void,
  () => void,
] => {
  const { params, appendParam, setParam, deleteParam } = useURLParams();

  const [tabView, setTabView] = React.useState<TemplateFilters['tabView']>('onlyDefault');
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
    switch (type) {
      case 'tabView':
        {
          setTabView(value);
        }
        break;

      case 'query':
        {
          setQuery(value);
        }
        break;

      default: {
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
    }
  };

  const clearAll = () => {
    setQuery('');
    setParam('query', '');
    deleteParam('query');
    deleteParam('support');
    deleteParam('osName');
    deleteParam('workload');
    deleteParam('flavor');

    setFilters({
      support: {
        count: 0,
        value: new Set([]),
      },
      osName: {
        count: 0,
        value: new Set([]),
      },
      workload: {
        count: 0,
        value: new Set([]),
      },
      flavor: {
        count: 0,
        value: new Set([]),
      },
    });
  };

  return [{ ...filters, tabView, query }, onSelect, clearAll];
};
