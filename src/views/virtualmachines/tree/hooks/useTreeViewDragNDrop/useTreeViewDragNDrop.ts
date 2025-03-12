import { MouseEvent, useCallback, useLayoutEffect } from 'react';

import { TreeViewDataItem } from '@patternfly/react-core';

import {
  addDragEvent,
  addListenerOnExpand,
  dropEventListeners,
  getFoldersFromTreeData,
  getVMsFromTreeData,
  removeDragEvent,
} from './utils';

const useTreeViewDragNDrop = (treeData: TreeViewDataItem[]) => {
  const vmTreeElements = getVMsFromTreeData(treeData);
  const folderTreeElements = getFoldersFromTreeData(treeData);

  useLayoutEffect(() => {
    if (!vmTreeElements) return;

    vmTreeElements.forEach(addDragEvent);

    return () => vmTreeElements.forEach(removeDragEvent);
  }, [vmTreeElements]);

  useLayoutEffect(() => {
    if (!folderTreeElements) return;

    const removeEventListeners = folderTreeElements.map(dropEventListeners);

    return () => removeEventListeners?.forEach((removeEventListener) => removeEventListener?.());
  }, [folderTreeElements]);

  const onExpandTreeViewElement = useCallback((event: MouseEvent, item: TreeViewDataItem) => {
    setTimeout(() => addListenerOnExpand(item), 500);
  }, []);

  return { onExpandTreeViewElement };
};

export default useTreeViewDragNDrop;
