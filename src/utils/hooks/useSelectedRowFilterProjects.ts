import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { PROJECT_LIST_FILTER_TYPE } from '@kubevirt-utils/utils/constants';

const useSelectedRowFilterProjects = (): string[] => {
  const [searchParams] = useSearchParams();
  return useMemo(
    () => searchParams.get(`rowFilter-${PROJECT_LIST_FILTER_TYPE}`)?.split(','),
    [searchParams],
  );
};

export default useSelectedRowFilterProjects;
