import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { isACMPath } from 'src/multicluster/urls';

/** Route-aware ACM detection for gallery scenes (no perspective URL side effects). */
const useIsACMPage = (): boolean => {
  const { pathname } = useLocation();
  return useMemo(() => isACMPath(pathname), [pathname]);
};

export default useIsACMPage;
