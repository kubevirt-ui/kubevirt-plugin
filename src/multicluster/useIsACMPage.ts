import { useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { isACMPath } from './urls';

const useIsACMPage = () => {
  const location = useLocation();

  return useMemo(() => isACMPath(location.pathname), [location.pathname]);
};

export default useIsACMPage;
