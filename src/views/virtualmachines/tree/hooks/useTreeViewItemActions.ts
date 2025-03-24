import { MouseEvent, useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { TreeViewDataItem, TreeViewProps } from '@patternfly/react-core';

import {
  getAllTreeViewFolderItems,
  getAllTreeViewItems,
  getAllTreeViewProjectItems,
  getAllTreeViewVMItems,
} from '../utils/utils';

import { RIGHT_CLICK_LISTENER } from './constants';
import { addDragEventListener, dropEventListeners } from './dragndrop';

type UseTreeViewItemActions = (treeData: TreeViewDataItem[]) => {
  addListeners: TreeViewProps['onExpand'];
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const useTreeViewItemActions: UseTreeViewItemActions = (treeData) => {
  const [triggerElement, setTriggerElement] = useState<HTMLElement>();

  const dropElements = useMemo(
    () => [...getAllTreeViewFolderItems(treeData), ...getAllTreeViewProjectItems(treeData)],
    [treeData],
  );

  const addRightClickEvent = useCallback((treeItem: TreeViewDataItem): (() => void) => {
    const element = document.getElementById(treeItem.id);

    const handler = (event) => {
      event.preventDefault();
      event.stopPropagation();
      setTriggerElement(element);
    };

    element?.addEventListener(RIGHT_CLICK_LISTENER, handler);

    return () => element?.removeEventListener(RIGHT_CLICK_LISTENER, handler);
  }, []);

  useLayoutEffect(() => {
    const allItems = getAllTreeViewItems(treeData)?.filter(
      (treeItem) => treeItem.id !== ALL_NAMESPACES_SESSION_KEY,
    );

    const removeRightClickListeners = allItems?.map(addRightClickEvent);

    return () => removeRightClickListeners?.forEach((removeListener) => removeListener?.());
  }, [treeData, addRightClickEvent]);

  useLayoutEffect(() => {
    const vmItems = getAllTreeViewVMItems(treeData);

    const removeDragListeners = vmItems?.map(addDragEventListener);

    return () => removeDragListeners?.forEach((removeListener) => removeListener?.());
  }, [treeData, addRightClickEvent]);

  useLayoutEffect(() => {
    if (!dropElements) return;

    const removeEventListeners = dropElements.map(dropEventListeners);

    return () => removeEventListeners?.forEach((removeEventListener) => removeEventListener?.());
  }, [dropElements]);

  const addListeners = useCallback(
    (event: MouseEvent, item: TreeViewDataItem) => {
      // wait for children elements to show
      setTimeout(() => {
        const allItems = getAllTreeViewItems([item])?.filter(
          (treeItem) => treeItem.id !== ALL_NAMESPACES_SESSION_KEY,
        );

        const vmItems = getAllTreeViewVMItems([item]);
        const dropInnerElements = [
          ...getAllTreeViewFolderItems([item]),
          ...getAllTreeViewProjectItems([item]),
        ];

        vmItems?.forEach(addDragEventListener);

        dropInnerElements.forEach(dropEventListeners);

        allItems.forEach(addRightClickEvent);
      }, 200);
    },
    [addRightClickEvent],
  );

  const hideMenu = useCallback(() => setTriggerElement(null), []);

  return {
    addListeners,
    hideMenu,
    triggerElement,
  };
};

export default useTreeViewItemActions;
