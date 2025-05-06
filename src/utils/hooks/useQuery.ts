import { useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

const useQuery = () => {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
};

export default useQuery;
