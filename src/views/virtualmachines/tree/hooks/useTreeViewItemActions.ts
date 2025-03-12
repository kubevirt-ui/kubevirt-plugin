import { MouseEvent, useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { TreeViewDataItem, TreeViewProps } from '@patternfly/react-core';

import { getAllTreeViewFolderItems, getAllTreeViewVMItems } from '../utils/utils';

import { RIGHT_CLICK_LISTENER } from './constants';
import { addDragEventListener, dropEventListeners } from './dragndrop';

type UseTreeViewItemActions = (treeData: TreeViewDataItem[]) => {
  addListeners: TreeViewProps['onExpand'];
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const useTreeViewItemActions: UseTreeViewItemActions = (treeData) => {
  const [triggerElement, setTriggerElement] = useState<HTMLElement>();

  const foldersItems = useMemo(() => getAllTreeViewFolderItems(treeData), [treeData]);

  const addVMRightClickEvent = useCallback((treeItem: TreeViewDataItem): (() => void) => {
    const element = document.getElementById(treeItem.id);

    const handler = (event) => {
      event.preventDefault();
      setTriggerElement(element);
    };

    element?.addEventListener(RIGHT_CLICK_LISTENER, handler);

    return () => element?.removeEventListener(RIGHT_CLICK_LISTENER, handler);
  }, []);

  useLayoutEffect(() => {
    const vmItems = getAllTreeViewVMItems(treeData);

    const removeRightClickListeners = vmItems?.map(addVMRightClickEvent);

    const removeDragListeners = vmItems?.map(addDragEventListener);

    return () => {
      removeRightClickListeners?.forEach((removeListener) => removeListener?.());
      removeDragListeners?.forEach((removeListener) => removeListener?.());
    };
  }, [treeData, addVMRightClickEvent]);

  useLayoutEffect(() => {
    if (!foldersItems) return;

    const removeEventListeners = foldersItems.map(dropEventListeners);

    return () => removeEventListeners?.forEach((removeEventListener) => removeEventListener?.());
  }, [foldersItems]);

  const addListeners = useCallback(
    (event: MouseEvent, item: TreeViewDataItem) => {
      // wait for children elements to show
      setTimeout(() => {
        const vmItems = getAllTreeViewVMItems([item]);
        const folderItems = getAllTreeViewFolderItems([item]);

        vmItems?.forEach((vmItem) => {
          addVMRightClickEvent(vmItem);
          addDragEventListener(vmItem);
        });

        folderItems.forEach(dropEventListeners);
      }, 200);
    },
    [addVMRightClickEvent],
  );

  const hideMenu = useCallback(() => setTriggerElement(null), []);

  return {
    addListeners,
    hideMenu,
    triggerElement,
  };
};

export default useTreeViewItemActions;
