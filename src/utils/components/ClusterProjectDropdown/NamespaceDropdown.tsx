import type { FC, JSX } from 'react';
import { useCallback, useMemo } from 'react';

import Dropdown from '@kubevirt-utils/components/ClusterProjectDropdown/Dropdown/Dropdown';
import type {
  DropdownConfig,
  DropdownCreateProjectMenuFooterProps,
} from '@kubevirt-utils/components/ClusterProjectDropdown/Dropdown/types';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useAllowedNamespaces from '@kubevirt-utils/hooks/useAllowedNamespaces/useAllowedNamespaces';
import useConsoleNamespaceBookmarks from '@kubevirt-utils/hooks/useConsoleNamespaceBookmarks/useConsoleNamespaceBookmarks';
import useConsoleShowSystemNamespaces from '@kubevirt-utils/hooks/useConsoleShowSystemNamespaces/useConsoleShowSystemNamespaces';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

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
  projectAccessReview?: FleetAccessReviewResourceAttributes;
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
  projectAccessReview,
  selectedProject,
}): JSX.Element => {
  const { t } = useKubevirtTranslation();

  const consoleSettingsCluster = bookmarkCluster ?? cluster;

  const { namespaces, namespacesLoaded } = useAllowedNamespaces(
    projectAccessReview ?? null,
    cluster,
  );

  const [bookmarks, updateBookmarks, bookmarksLoaded] =
    useConsoleNamespaceBookmarks(consoleSettingsCluster);
  const [showSystemNamespaces, setShowSystemNamespaces, showSystemLoaded] =
    useConsoleShowSystemNamespaces(consoleSettingsCluster);

  const visibleNamespaces = useMemo<K8sResourceCommon[] | null>(() => {
    if (!namespaces) {
      return null;
    }

    if (!onlyUserProjects) {
      return namespaces;
    }

    return namespaces.filter(isUserProject);
  }, [namespaces, onlyUserProjects]);

  const hasSystemNamespaces = useMemo(
    () => (namespaces ?? []).some((namespace) => !isUserProject(namespace)),
    [namespaces],
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

  const isDropdownLoading = isLoading || !namespacesLoaded;

  return (
    <Dropdown<K8sResourceCommon>
      bookmarks={bookmarksProp}
      config={config}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
      extractKey={extractName}
      extractTitle={extractName}
      includeAllItems={includeAllProjects}
      isLoading={isDropdownLoading}
      items={visibleNamespaces}
      itemsLoaded={namespacesLoaded}
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
