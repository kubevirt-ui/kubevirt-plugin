import { useMemo } from 'react';

import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { TreeViewDataItem } from '@patternfly/react-core';

import { HIDE, PROJECT_SELECTOR_PREFIX, SHOW, SHOW_EMPTY_PROJECTS_KEY } from '../utils/constants';
import { filterNamespaceItems } from '../utils/utils';

type UseFilteredTreeView = (treeData: TreeViewDataItem[]) => TreeViewDataItem[];

const useFilteredTreeView: UseFilteredTreeView = (treeData) => {
  const [showEmptyProjects] = useLocalStorage(SHOW_EMPTY_PROJECTS_KEY, HIDE);

  const filteredTreeData = useMemo(() => {
    const items = treeData;

    const hasNonSystemNamespaces = items
      .filter((item) => item.id?.startsWith(PROJECT_SELECTOR_PREFIX))
      .some((item) => !isSystemNamespace(item.name as string));

    return items
      .map((opt) => Object.assign({}, opt))
      .filter((item) =>
        filterNamespaceItems(item, showEmptyProjects === SHOW, hasNonSystemNamespaces),
      );
  }, [treeData, showEmptyProjects]);

  return filteredTreeData;
};

export default useFilteredTreeView;
