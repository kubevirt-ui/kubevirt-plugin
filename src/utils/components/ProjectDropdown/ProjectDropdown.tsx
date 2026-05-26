import React, { FC, JSX, useMemo } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useProjectOrNamespaceModel } from '@kubevirt-utils/hooks/useProjectOrNamespaceModel';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { getProjectOptions } from '@kubevirt-utils/components/ProjectDropdown/utils/utils';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useConsoleNamespaceBookmarks from '@kubevirt-utils/hooks/useConsoleNamespaceBookmarks/useConsoleNamespaceBookmarks';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type ProjectDropdownProps = {
  cluster?: string;
  includeAllProjects?: boolean;
  isDisabled?: boolean;
  onChange: (project: string) => void;
  selectedProject: string;
  useConsoleFavorites?: boolean;
};

const ProjectDropdown: FC<ProjectDropdownProps> = ({
  cluster,
  includeAllProjects = true,
  isDisabled = false,
  onChange,
  selectedProject,
  useConsoleFavorites = true,
}): JSX.Element => {
  const model = useProjectOrNamespaceModel();
  const [projects] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(model),
    isList: true,
    namespaced: false,
  });

  const [bookmarks, updateBookmarks, bookmarksLoaded] = useConsoleNamespaceBookmarks(cluster);

  const options = useMemo(() => {
    if (!useConsoleFavorites || !bookmarksLoaded) {
      return getProjectOptions(includeAllProjects, projects, {}, undefined);
    }
    return getProjectOptions(includeAllProjects, projects, bookmarks, updateBookmarks);
  }, [
    includeAllProjects,
    projects,
    bookmarks,
    updateBookmarks,
    useConsoleFavorites,
    bookmarksLoaded,
  ]);

  return (
    <div className="project-dropdown">
      <InlineFilterSelect
        options={options}
        selected={selectedProject || ALL_PROJECTS}
        setSelected={onChange}
        toggleProps={{ isDisabled, isFullWidth: true }}
      />
    </div>
  );
};

export default ProjectDropdown;
