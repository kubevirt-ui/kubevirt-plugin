import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { PROJECT_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';

const useSelectedRowFilterProjects = (): string[] => {
  const [searchParams] = useSearchParams();
  const projectParam = searchParams.get(PROJECT_LIST_FILTER_PARAM);
  return useMemo(() => projectParam?.split(',') ?? [], [projectParam]);
};

export default useSelectedRowFilterProjects;
