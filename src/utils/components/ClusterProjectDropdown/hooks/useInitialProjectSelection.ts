import { useEffect } from 'react';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export type UseInitialProjectSelectionProps = {
  cluster: string;
  includeAllProjects: boolean;
  isACMPage: boolean;
  namespace: string;
  onProjectChange: (project: string) => void;
  projectLoaded: boolean;
  projects: string[];
  showProjectDropdown: boolean;
};

export const useInitialProjectSelection = ({
  cluster,
  includeAllProjects,
  isACMPage,
  namespace,
  onProjectChange,
  projectLoaded,
  projects,
  showProjectDropdown,
}: UseInitialProjectSelectionProps): void => {
  useEffect(() => {
    if (!isACMPage) return;
    if (includeAllProjects) return;

    if (cluster && isEmpty(namespace) && projectLoaded && showProjectDropdown) {
      const defaultProject = projects?.find((project) => project === DEFAULT_NAMESPACE);
      const selectedProject = defaultProject || projects?.[0] || ALL_PROJECTS;
      onProjectChange(selectedProject);
    }
  }, [
    isACMPage,
    cluster,
    includeAllProjects,
    namespace,
    onProjectChange,
    projectLoaded,
    projects,
    showProjectDropdown,
  ]);
};
