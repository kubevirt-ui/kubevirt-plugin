import React, { FC, JSX, useCallback, useMemo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import Dropdown, {
  DropdownConfig,
} from '@kubevirt-utils/components/ClusterProjectDropdown/Dropdown/Dropdown';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useConsoleNamespaceBookmarks from '@kubevirt-utils/hooks/useConsoleNamespaceBookmarks/useConsoleNamespaceBookmarks';
import useConsoleShowSystemNamespaces from '@kubevirt-utils/hooks/useConsoleShowSystemNamespaces/useConsoleShowSystemNamespaces';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { extractName } from './utils';

type NamespaceDropdownProps = {
  bookmarkCluster?: string;
  cluster?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  includeAllProjects?: boolean;
  onChange: (project: string) => void;
  selectedProject: string;
};

const NamespaceDropdown: FC<NamespaceDropdownProps> = ({
  bookmarkCluster,
  cluster,
  disabled = false,
  disabledTooltip,
  includeAllProjects = true,
  onChange,
  selectedProject,
}): JSX.Element => {
  const { t } = useKubevirtTranslation();
  const settingsCluster = bookmarkCluster ?? cluster;

  const [projects, projectsLoaded] = useK8sWatchData<K8sResourceCommon[]>({
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
    () => (projects || []).some((project) => isSystemNamespace(getName(project))),
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

  const showSystemToggle = useMemo(
    () =>
      showSystemLoaded
        ? {
            hasSystemItems: hasSystemNamespaces,
            onChange: onShowSystemNamespacesChange,
            show: showSystemNamespaces,
          }
        : undefined,
    [hasSystemNamespaces, onShowSystemNamespacesChange, showSystemLoaded, showSystemNamespaces],
  );

  return (
    <Dropdown<K8sResourceCommon>
      bookmarks={bookmarksProp}
      config={config}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
      extractKey={extractName}
      extractTitle={extractName}
      includeAllItems={includeAllProjects}
      items={projects || null}
      itemsLoaded={projectsLoaded}
      onChange={onChange}
      selectedItem={selectedProject}
      showSystemToggle={showSystemToggle}
    />
  );
};

export default NamespaceDropdown;
