import React, { FC, JSX, useMemo } from 'react';

import Dropdown, {
  DropdownConfig,
} from '@kubevirt-utils/components/ClusterProjectDropdown/Dropdown/Dropdown';
import { ALL_CLUSTERS, ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import useConsoleClusterBookmarks from '@kubevirt-utils/hooks/useConsoleClusterBookmarks/useConsoleClusterBookmarks';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

type ClusterDropdownProps = {
  bookmarkCluster?: string;
  disabled?: boolean;
  disabledClusters?: string[];
  disabledItemTooltip?: string;
  includeAllClusters?: boolean;
  omittedClusters?: string[];
  onChange: (cluster: string) => void;
  selectedCluster: string;
};

const ClusterDropdown: FC<ClusterDropdownProps> = ({
  bookmarkCluster,
  disabled = false,
  disabledClusters,
  disabledItemTooltip,
  includeAllClusters = true,
  omittedClusters,
  onChange,
  selectedCluster,
}): JSX.Element => {
  const { t } = useKubevirtTranslation();
  const [clusterNames, clustersLoaded] = useFleetClusterNames();
  const [bookmarks, updateBookmarks, bookmarksLoaded] = useConsoleClusterBookmarks(bookmarkCluster);

  const isItemDisabled = useMemo(() => {
    if (!disabledClusters || disabledClusters.length === 0) {
      return undefined;
    }
    const disabledSet = new Set(disabledClusters);
    return (key: string) => disabledSet.has(key);
  }, [disabledClusters]);

  const config: DropdownConfig = useMemo(
    () => ({
      allItemsKey: ALL_CLUSTERS_KEY,
      allItemsTitle: ALL_CLUSTERS,
      cssPrefix: 'co-cluster-dropdown',
      dataTestId: 'cluster-dropdown-menu',
      itemsLabel: t('Clusters'),
      noItemsFoundTitle: t('No clusters found'),
      selectPlaceholder: t('Select cluster...'),
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
    <Dropdown
      bookmarks={{
        bookmarks: bookmarks || {},
        bookmarksLoaded,
        updateBookmarks: wrappedUpdateBookmarks,
      }}
      config={config}
      disabled={disabled}
      disabledItemTooltip={disabledItemTooltip}
      extractKey={(name) => name}
      extractTitle={(name) => name}
      includeAllItems={includeAllClusters}
      isItemDisabled={isItemDisabled}
      items={clusterNames || null}
      itemsLoaded={clustersLoaded}
      omittedItems={omittedClusters}
      onChange={onChange}
      selectedItem={selectedCluster}
    />
  );
};

export default ClusterDropdown;
