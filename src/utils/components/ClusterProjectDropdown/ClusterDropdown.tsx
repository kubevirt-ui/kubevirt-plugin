import React, { type FC, type ReactElement, useMemo } from 'react';

import Dropdown, {
  type DropdownConfig,
} from '@kubevirt-utils/components/ClusterProjectDropdown/Dropdown/Dropdown';
import { ALL_CLUSTERS, ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import useConsoleClusterBookmarks from '@kubevirt-utils/hooks/useConsoleClusterBookmarks/useConsoleClusterBookmarks';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

import { identity } from './utils';

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
}): ReactElement => {
  const { t } = useKubevirtTranslation();
  const [clusterNames, clustersLoaded] = useFleetClusterNames();
  const [bookmarks, updateBookmarks, bookmarksLoaded] = useConsoleClusterBookmarks(bookmarkCluster);

  const isItemDisabled = useMemo((): ((key: string) => boolean) | undefined => {
    if (!disabledClusters || disabledClusters.length === 0) {
      return undefined;
    }
    const disabledSet = new Set(disabledClusters);
    return (key: string): boolean => disabledSet.has(key);
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

  const effectiveOmittedClusters = useMemo((): string[] | undefined => {
    if (includeAllClusters) {
      return omittedClusters;
    }

    const omitted = new Set(omittedClusters ?? []);
    omitted.add(ALL_CLUSTERS_KEY);
    return Array.from(omitted);
  }, [includeAllClusters, omittedClusters]);

  const bookmarksProp = useMemo(
    () => ({
      bookmarks: bookmarks ?? {},
      bookmarksLoaded,
      updateBookmarks: updateBookmarks ?? null,
    }),
    [bookmarks, bookmarksLoaded, updateBookmarks],
  );

  return (
    <Dropdown
      bookmarks={bookmarksProp}
      config={config}
      disabled={disabled}
      disabledItemTooltip={disabledItemTooltip}
      extractKey={identity}
      extractTitle={identity}
      includeAllItems={includeAllClusters}
      isItemDisabled={isItemDisabled}
      items={clusterNames ?? null}
      itemsLoaded={clustersLoaded}
      omittedItems={effectiveOmittedClusters}
      onChange={onChange}
      selectedItem={selectedCluster}
    />
  );
};

export default ClusterDropdown;
