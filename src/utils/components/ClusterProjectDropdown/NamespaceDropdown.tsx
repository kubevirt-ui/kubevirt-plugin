import React, { FC, JSX, useMemo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import Dropdown, {
  DropdownConfig,
} from '@kubevirt-utils/components/ClusterProjectDropdown/Dropdown/Dropdown';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useConsoleNamespaceBookmarks from '@kubevirt-utils/hooks/useConsoleNamespaceBookmarks/useConsoleNamespaceBookmarks';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type NamespaceDropdownProps = {
  cluster?: string;
  disabled?: boolean;
  includeAllProjects?: boolean;
  onChange: (project: string) => void;
  selectedProject: string;
};

const NamespaceDropdown: FC<NamespaceDropdownProps> = ({
  cluster,
  disabled = false,
  includeAllProjects = true,
  onChange,
  selectedProject,
}): JSX.Element => {
  const { t } = useKubevirtTranslation();

  const [projects, projectsLoaded] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const [bookmarks, updateBookmarks, bookmarksLoaded] = useConsoleNamespaceBookmarks(cluster);

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

  const wrappedUpdateBookmarks = useMemo(
    () =>
      updateBookmarks
        ? async (newBookmarks: Record<string, boolean>): Promise<Record<string, boolean>> => {
            return await updateBookmarks(newBookmarks);
          }
        : null,
    [updateBookmarks],
  );

  return (
    <Dropdown<K8sResourceCommon>
      bookmarks={{
        bookmarks: bookmarks || {},
        bookmarksLoaded,
        updateBookmarks: wrappedUpdateBookmarks,
      }}
      config={config}
      disabled={disabled}
      extractKey={(proj) => getName(proj)}
      extractTitle={(proj) => getName(proj)}
      includeAllItems={includeAllProjects}
      items={projects || null}
      itemsLoaded={projectsLoaded}
      onChange={onChange}
      selectedItem={selectedProject}
    />
  );
};

export default NamespaceDropdown;
