import { useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { isACMPath } from './urls';

const useIsACMPage = () => {
  const { pathname } = useLocation();
  const isACMPathResult = useMemo(() => isACMPath(pathname), [pathname]);

  return isACMPathResult;
};

export default useIsACMPage;
