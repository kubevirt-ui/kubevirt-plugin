import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ALL_NAMESPACES_PATH } from '@virtualmachines/tree/hooks/constants';
import { VIRTUALIZATION_PATHS } from '@virtualmachines/tree/utils/constants';

import useProjects from './useProjects';

type UseForceProjectSelectionOptions = {
  enabled?: boolean;
  pathConditions?: string[];
};

export const useForceProjectSelection = (options: UseForceProjectSelectionOptions = {}) => {
  const { enabled = true, pathConditions = [VIRTUALIZATION_PATHS.BASE] } = options;
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [projectNames, projectNamesLoaded] = useProjects();

  useEffect(() => {
    if (!enabled) return;

    const shouldRedirect = pathConditions.some(
      (condition) =>
        location.pathname.includes(ALL_NAMESPACES_PATH) && location.pathname.includes(condition),
    );

    if (!isAdmin && shouldRedirect && projectNamesLoaded && !isEmpty(projectNames)) {
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
