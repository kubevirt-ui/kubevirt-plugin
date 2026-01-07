import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { PERSPECTIVES } from '@kubevirt-utils/constants/constants';
import { useActivePerspective } from '@openshift-console/dynamic-plugin-sdk';

import { isACMPath } from './urls';

type UseIsACMPageOptions = {
  activePerspectiveSync?: boolean;
};

const useIsACMPage = ({ activePerspectiveSync = true }: UseIsACMPageOptions = {}) => {
  const location = useLocation();
  const [activePerspective, setActivePerspective] = useActivePerspective();
  const isACMPathResult = useMemo(() => isACMPath(location.pathname), [location.pathname]);

  useEffect(() => {
    if (
      activePerspectiveSync &&
      isACMPathResult &&
      activePerspective !== PERSPECTIVES.FLEET_VIRTUALIZATION &&
      setActivePerspective !== undefined
    ) {
      setActivePerspective(PERSPECTIVES.FLEET_VIRTUALIZATION);
    }
  }, [activePerspectiveSync, isACMPathResult, activePerspective, setActivePerspective]);

  return isACMPathResult;
};

export default useIsACMPage;
