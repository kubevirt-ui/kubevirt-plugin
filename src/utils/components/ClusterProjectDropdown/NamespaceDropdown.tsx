import type { FC, JSX } from 'react';
import { useCallback, useMemo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import Dropdown from '@kubevirt-utils/components/ClusterProjectDropdown/Dropdown/Dropdown';
import type {
  DropdownConfig,
  DropdownCreateProjectMenuFooterProps,
} from '@kubevirt-utils/components/ClusterProjectDropdown/Dropdown/types';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useConsoleNamespaceBookmarks from '@kubevirt-utils/hooks/useConsoleNamespaceBookmarks/useConsoleNamespaceBookmarks';
import useConsoleShowSystemNamespaces from '@kubevirt-utils/hooks/useConsoleShowSystemNamespaces/useConsoleShowSystemNamespaces';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import CreateProjectFromDropdownFooter from './components/CreateProjectFromDropdownFooter';
import { extractName, isUserProject } from './utils';

export type NamespaceDropdownProjectCreatedHandler = (project: K8sResourceCommon) => void;

export type NamespaceDropdownProps = {
  bookmarkCluster?: string;
  cluster?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  includeAllProjects?: boolean;
  isLoading?: boolean;
  onChange: (project: string) => void;
  onlyUserProjects?: boolean;
  onProjectCreated?: NamespaceDropdownProjectCreatedHandler;
  selectedProject: string;
};

const NamespaceDropdown: FC<NamespaceDropdownProps> = ({
  bookmarkCluster,
  cluster,
  disabled = false,
  disabledTooltip,
  includeAllProjects = true,
  isLoading = false,
  onChange,
  onlyUserProjects = false,
  onProjectCreated,
  selectedProject,
}): JSX.Element => {
  const { t } = useKubevirtTranslation();

  const consoleSettingsCluster = bookmarkCluster ?? cluster;

  const [projects, projectsLoaded] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const [bookmarks, updateBookmarks, bookmarksLoaded] =
    useConsoleNamespaceBookmarks(consoleSettingsCluster);
  const [showSystemNamespaces, setShowSystemNamespaces, showSystemLoaded] =
    useConsoleShowSystemNamespaces(consoleSettingsCluster);

  const visibleProjects = useMemo<K8sResourceCommon[] | null>(() => {
    if (!projects) {
      return null;
    }

    if (!onlyUserProjects) {
      return projects;
    }

    return projects.filter(isUserProject);
  }, [onlyUserProjects, projects]);

  const hasSystemNamespaces = useMemo(
    () => (projects || []).some((project) => !isUserProject(project)),
    [projects],
  );

  const config: DropdownConfig = useMemo(
    () => ({
      allItemsKey: ALL_PROJECTS,
      allItemsTitle: t('All projects'),
      cssPrefix: 'co-namespace-dropdown',
      dataTestId: 'namespace-dropdown-menu',
      itemsLabel: t('Projects'),
      noItemsFoundTitle: t('No projects found'),
      selectPlaceholder: t('Select project...'),
    }),
    [t],
  );

  const bookmarksProp = useMemo(
    () => ({
      bookmarks: bookmarks || {},
      bookmarksLoaded,
      updateBookmarks: updateBookmarks ?? null,
    }),
    [bookmarks, bookmarksLoaded, updateBookmarks],
  );

  const onShowSystemNamespacesChange = useCallback(
    (showSystem: boolean) => {
      void setShowSystemNamespaces(showSystem);
    },
    [setShowSystemNamespaces],
  );

  const showSystemToggle = useMemo(() => {
    if (onlyUserProjects || !showSystemLoaded) {
      return undefined;
    }

    return {
      hasSystemItems: hasSystemNamespaces,
      onChange: onShowSystemNamespacesChange,
      show: showSystemNamespaces,
    };
  }, [
    hasSystemNamespaces,
    onShowSystemNamespacesChange,
    onlyUserProjects,
    showSystemLoaded,
    showSystemNamespaces,
  ]);

  const menuFooterProps = useMemo((): DropdownCreateProjectMenuFooterProps | undefined => {
    if (!onProjectCreated) {
      return undefined;
    }
    return { initialCluster: cluster, onProjectCreated };
  }, [cluster, onProjectCreated]);

  return (
    <Dropdown<K8sResourceCommon>
      bookmarks={bookmarksProp}
      config={config}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
      extractKey={extractName}
      extractTitle={extractName}
      includeAllItems={includeAllProjects}
      isLoading={isLoading}
      items={visibleProjects}
      itemsLoaded={projectsLoaded}
      menuFooter={onProjectCreated ? CreateProjectFromDropdownFooter : undefined}
      menuFooterProps={menuFooterProps}
      onChange={onChange}
      preserveUnknownSelectedItem
      selectedItem={selectedProject}
      showSystemToggle={showSystemToggle}
    />
  );
};

export default NamespaceDropdown;
