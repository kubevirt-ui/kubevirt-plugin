import { useSearchParams } from 'react-router';

import { PROJECT_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';

const useSelectedRowFilterProjects = (): string[] => {
  const [searchParams] = useSearchParams();
  return searchParams.getAll(PROJECT_LIST_FILTER_PARAM);
};

export default useSelectedRowFilterProjects;
