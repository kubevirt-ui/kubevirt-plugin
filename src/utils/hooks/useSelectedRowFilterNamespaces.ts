import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { NAMESPACE_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';

const useSelectedRowFilterNamespaces = (): string[] => {
  const [searchParams] = useSearchParams();
  const namespaceParam = searchParams.get(NAMESPACE_LIST_FILTER_PARAM);
  return useMemo(() => namespaceParam?.split(',') ?? [], [namespaceParam]);
};

export default useSelectedRowFilterNamespaces;
