import { useMemo } from 'react';

import { isEmpty } from '../utils/utils';

import useNamespaceParam from './useNamespaceParam';
import useSelectedRowFilterNamespaces from './useSelectedRowFilterNamespaces';

const useListNamespaces = (): string[] => {
  const rowFilterNamespaces = useSelectedRowFilterNamespaces();
  const namespace = useNamespaceParam();
  const namespaces = useMemo(() => {
    if (!isEmpty(rowFilterNamespaces)) return rowFilterNamespaces;
    if (namespace) return [namespace];
    return [];
  }, [rowFilterNamespaces, namespace]);
  return namespaces;
};

export default useListNamespaces;
