import { useMemo } from 'react';
import { useLocation } from 'react-router';

const useQuery = (): URLSearchParams => {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
};

export default useQuery;
