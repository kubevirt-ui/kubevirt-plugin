import { useMemo } from 'react';

import { isEmpty } from '../utils/utils';

import useNamespaceParam from './useNamespaceParam';
import useSelectedRowFilterProjects from './useSelectedRowFilterProjects';

const useListNamespaces = (): string[] => {
  const rowFilterNamespaces = useSelectedRowFilterProjects();
  const namespace = useNamespaceParam();
  const namespaces = useMemo(() => {
    if (!isEmpty(rowFilterNamespaces)) return rowFilterNamespaces;
    if (namespace) return [namespace];
    return [];
  }, [rowFilterNamespaces, namespace]);
  return namespaces;
};

export default useListNamespaces;
