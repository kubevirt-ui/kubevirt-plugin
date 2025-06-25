import { MouseEvent, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import useRemoveFolderQuery from '@kubevirt-utils/components/MoveVMToFolderModal/hooks/useRemoveFolderQuery';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { TreeViewDataItem, TreeViewProps } from '@patternfly/react-core';

import {
  getAllTreeViewFolderItems,
  getAllTreeViewItems,
  getAllTreeViewProjectItems,
  getAllTreeViewVMItems,
  TreeViewDataItemWithHref,
} from '../utils/utils';

import { RIGHT_CLICK_LISTENER } from './constants';
import { addDragEventListener, addDropEventListeners } from './dragndrop';

type UseTreeViewItemActions = (treeData: TreeViewDataItem[]) => {
  addListeners: TreeViewProps['onExpand'];
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const useTreeViewItemActions: UseTreeViewItemActions = (treeData) => {
  const [triggerElement, setTriggerElement] = useState<HTMLElement>();

  const removeFolderQuery = useRemoveFolderQuery();
  const navigate = useNavigate();

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

    const removeEventListeners = dropElements.map((element) =>
      addDropEventListeners(element, removeFolderQuery),
    );

    return () => removeEventListeners?.forEach((removeEventListener) => removeEventListener?.());
  }, [dropElements, removeFolderQuery]);

  const addListeners = useCallback(
    (_event: MouseEvent, item: TreeViewDataItem) => {
      if (item.id.startsWith('cluster') && (item as TreeViewDataItemWithHref).href)
        navigate((item as TreeViewDataItemWithHref).href);

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

        dropInnerElements.forEach((element) => addDropEventListeners(element, removeFolderQuery));

        allItems.forEach(addRightClickEvent);
      }, 200);
    },
    [addRightClickEvent, navigate, removeFolderQuery],
  );

  const hideMenu = useCallback(() => setTriggerElement(null), []);

  return {
    addListeners,
    hideMenu,
    triggerElement,
  };
};

export default useTreeViewItemActions;
