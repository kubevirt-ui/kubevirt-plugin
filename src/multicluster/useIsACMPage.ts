import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { PERSPECTIVES } from '@kubevirt-utils/constants/constants';
import { useActivePerspective } from '@openshift-console/dynamic-plugin-sdk';

import { isACMPath } from './urls';

const PERSPECTIVE_PARAM = 'perspective';

type UseIsACMPageOptions = {
  activePerspectiveSync?: boolean;
};

const useIsACMPage = ({ activePerspectiveSync = true }: UseIsACMPageOptions = {}) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [activePerspective] = useActivePerspective();
  const isACMPathResult = useMemo(() => isACMPath(pathname), [pathname]);

  // Activate the fleet perspective by adding ?perspective= to the URL.
  // The Console's DetectPerspective component reads this param and calls
  // setActivePerspective(param, createPath(location)), which passes the
  // full current URL as `next` — avoiding both the /dashboards redirect
  // and the namespace handler loop.
  useEffect(() => {
    if (!activePerspectiveSync || !isACMPathResult) return;
    if (activePerspective === PERSPECTIVES.FLEET_VIRTUALIZATION) return;

    const searchParams = new URLSearchParams(search);
    if (!searchParams.has(PERSPECTIVE_PARAM)) {
      searchParams.set(PERSPECTIVE_PARAM, PERSPECTIVES.FLEET_VIRTUALIZATION);
      navigate(`${pathname}?${searchParams.toString()}`, { replace: true });
    }
  }, [activePerspectiveSync, isACMPathResult, activePerspective, pathname, search, navigate]);

  // Clean up the ?perspective= param once the perspective is active.
  useEffect(() => {
    if (!isACMPathResult || activePerspective !== PERSPECTIVES.FLEET_VIRTUALIZATION) return;

    const url = new URL(window.location.href);
    if (url.searchParams.has(PERSPECTIVE_PARAM)) {
      url.searchParams.delete(PERSPECTIVE_PARAM);
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
  }, [isACMPathResult, activePerspective]);

  return isACMPathResult;
};

export default useIsACMPage;
