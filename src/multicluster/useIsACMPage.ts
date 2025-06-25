import { useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

const useIsACMPage = () => {
  const location = useLocation();

  return useMemo(
    () => location.pathname.startsWith('/multicloud/infrastructure/virtualmachines'),
    [location.pathname],
  );
};

export default useIsACMPage;
