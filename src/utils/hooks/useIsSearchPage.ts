import { useMemo } from 'react';
import { useLocation } from 'react-router';

const useIsSearchPage = () => {
  const location = useLocation();

  return useMemo(() => location?.pathname?.includes('/search'), [location]);
};

export default useIsSearchPage;
