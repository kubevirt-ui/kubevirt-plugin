import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { VIRTUALIZATION_PATHS } from '@kubevirt-utils/constants/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ALL_NAMESPACES_PATH } from '@virtualmachines/tree/hooks/constants';

import useNamespaces from './useNamespaces';

export const useForceNamespaceSelection = (
  pathConditions: string[] = [VIRTUALIZATION_PATHS.BASE],
  enabled: boolean = true,
) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [namespaceNames, namespaceNamesLoaded] = useNamespaces();

  useEffect(() => {
    if (!enabled) return;
    if (runningTourSignal.value) return;

    // Check if the current path includes ALL_NAMESPACES_PATH and any of the pathConditions
    const shouldRedirect = pathConditions.some(
      (condition) =>
        location.pathname?.includes(ALL_NAMESPACES_PATH) && location.pathname?.includes(condition),
    );

    // Redirect to default namespace if user is not admin and is on all-namespaces path
    const shouldForceNamespaceRedirect =
      !isAdmin && shouldRedirect && namespaceNamesLoaded && !isEmpty(namespaceNames);

    if (shouldForceNamespaceRedirect) {
      const defaultNamespace = namespaceNames.includes(DEFAULT_NAMESPACE)
        ? DEFAULT_NAMESPACE
        : namespaceNames[0];

      const newPathname = location.pathname.replace(ALL_NAMESPACES_PATH, `/ns/${defaultNamespace}/`);
      navigate(newPathname);
    }
  }, [
    location.pathname,
    isAdmin,
    namespaceNames,
    namespaceNamesLoaded,
    navigate,
    pathConditions,
    enabled,
  ]);
};
