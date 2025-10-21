import { useMemo } from 'react';

import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import useSelectedRowFilterProjects from '@kubevirt-utils/hooks/useSelectedRowFilterProjects';
import { TreeViewDataItem } from '@patternfly/react-core';

import { getAllTreeViewClusterItems, getAllTreeViewProjectItems } from '../utils/utils';

const useSelectedRowFilterTreeItems = (treeData: TreeViewDataItem[]) => {
  const allProjectsSelected = useSelectedRowFilterProjects();
  const allClustersSelected = useSelectedRowFilterClusters();

  const selectedProjectsTreeItems = useMemo(
    () =>
      getAllTreeViewProjectItems(treeData).filter((item) =>
        allProjectsSelected?.find((project) => item.id.endsWith(`/${project}`)),
      ),
    [treeData, allProjectsSelected],
  );
  const selectedClustersTreeItems = useMemo(
    () =>
      getAllTreeViewClusterItems(treeData).filter((item) =>
        allClustersSelected?.find((cluster) => item.id.endsWith(`/${cluster}`)),
      ),
    [treeData, allClustersSelected],
  );

  return useMemo(
    () => [...selectedProjectsTreeItems, ...selectedClustersTreeItems],
    [selectedProjectsTreeItems, selectedClustersTreeItems],
  );
};

export default useSelectedRowFilterTreeItems;
