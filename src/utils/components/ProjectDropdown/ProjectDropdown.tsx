import React, { FC, JSX, useCallback, useMemo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import ShowSystemNamespacesSwitch from '@kubevirt-utils/components/ClusterProjectDropdown/Dropdown/ShowSystemNamespacesSwitch';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { getProjectOptions } from '@kubevirt-utils/components/ProjectDropdown/utils/utils';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useConsoleNamespaceBookmarks from '@kubevirt-utils/hooks/useConsoleNamespaceBookmarks/useConsoleNamespaceBookmarks';
import useConsoleShowSystemNamespaces from '@kubevirt-utils/hooks/useConsoleShowSystemNamespaces/useConsoleShowSystemNamespaces';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type ProjectDropdownProps = {
  bookmarkCluster?: string;
  cluster?: string;
  includeAllProjects?: boolean;
  isDisabled?: boolean;
  onChange: (project: string) => void;
  selectedProject: string;
  useConsoleFavorites?: boolean;
};

const ProjectDropdown: FC<ProjectDropdownProps> = ({
  bookmarkCluster,
  cluster,
  includeAllProjects = true,
  isDisabled = false,
  onChange,
  selectedProject,
  useConsoleFavorites = true,
}): JSX.Element => {
  const settingsCluster = bookmarkCluster ?? cluster;

  const [projects] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const [bookmarks, updateBookmarks, bookmarksLoaded] =
    useConsoleNamespaceBookmarks(settingsCluster);
  const [showSystemNamespaces, setShowSystemNamespaces, showSystemLoaded] =
    useConsoleShowSystemNamespaces(settingsCluster);

  const hasSystemNamespaces = useMemo(
    () =>
      (projects || []).some((project) => {
        const name = getName(project);
        return name && isSystemNamespace(name);
      }),
    [projects],
  );

  const options = useMemo(() => {
    if (!useConsoleFavorites || !bookmarksLoaded) {
      return getProjectOptions({
        includeAllProjects,
        projects,
        showSystemNamespaces: showSystemLoaded ? showSystemNamespaces : true,
      });
    }
    return getProjectOptions({
      bookmarks,
      includeAllProjects,
      projects,
      showSystemNamespaces: showSystemLoaded ? showSystemNamespaces : true,
      updateBookmarks,
    });
  }, [
    includeAllProjects,
    projects,
    bookmarks,
    updateBookmarks,
    useConsoleFavorites,
    bookmarksLoaded,
    showSystemLoaded,
    showSystemNamespaces,
  ]);

  const onShowSystemNamespacesChange = useCallback(
    (showSystem: boolean) => {
      void setShowSystemNamespaces(showSystem).catch(() => {
        // rejection handled; hook already rolls back optimistic state
      });
    },
    [setShowSystemNamespaces],
  );

  const menuHeader = useMemo(() => {
    if (!showSystemLoaded) {
      return undefined;
    }

    return (
      <ShowSystemNamespacesSwitch
        cssPrefix="co-namespace-dropdown"
        hasSystemNamespaces={hasSystemNamespaces}
        isChecked={showSystemNamespaces}
        onChange={onShowSystemNamespacesChange}
      />
    );
  }, [hasSystemNamespaces, onShowSystemNamespacesChange, showSystemLoaded, showSystemNamespaces]);

  return (
    <div className="project-dropdown">
      <InlineFilterSelect
        menuHeader={menuHeader}
        options={options}
        selected={selectedProject || ALL_PROJECTS}
        setSelected={onChange}
        toggleProps={{ isDisabled, isFullWidth: true }}
      />
    </div>
  );
};

export default ProjectDropdown;
