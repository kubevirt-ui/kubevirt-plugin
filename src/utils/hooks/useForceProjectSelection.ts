import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ALL_NAMESPACES_PATH } from '@virtualmachines/tree/hooks/constants';
import { VIRTUALIZATION_PATHS } from '@virtualmachines/tree/utils/constants';

import useProjects from './useProjects';

export const useForceProjectSelection = (
  pathConditions: string[] = [VIRTUALIZATION_PATHS.BASE],
  enabled: boolean = true,
) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [projectNames, projectNamesLoaded] = useProjects();

  useEffect(() => {
    if (!enabled) return;

    // Check if the current path includes ALL_NAMESPACES_PATH and any of the pathConditions
    const shouldRedirect = pathConditions.some(
      (condition) =>
        location.pathname?.includes(ALL_NAMESPACES_PATH) && location.pathname?.includes(condition),
    );

    // Redirect to default project if user is not admin and is on all-namespaces path
    const shouldForceProjectRedirect =
      !isAdmin && shouldRedirect && projectNamesLoaded && !isEmpty(projectNames);

    if (shouldForceProjectRedirect) {
      const defaultProject = projectNames.includes(DEFAULT_NAMESPACE)
        ? DEFAULT_NAMESPACE
        : projectNames[0];

      const newPathname = location.pathname.replace(ALL_NAMESPACES_PATH, `/ns/${defaultProject}/`);
      navigate(newPathname);
    }
  }, [
    location.pathname,
    isAdmin,
    projectNames,
    projectNamesLoaded,
    navigate,
    pathConditions,
    enabled,
  ]);
};
