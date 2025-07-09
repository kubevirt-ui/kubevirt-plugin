import { MouseEvent, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import useRemoveFolderQuery from '@kubevirt-utils/components/MoveVMToFolderModal/hooks/useRemoveFolderQuery';
import { TreeViewDataItem, TreeViewProps } from '@patternfly/react-core';

import { CLUSTER_SELECTOR_PREFIX } from '../utils/constants';
import {
  getAllRightClickableTreeViewItems,
  getAllTreeViewFolderItems,
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
    const allRightClickableItems = getAllRightClickableTreeViewItems(treeData);

    const removeRightClickListeners = allRightClickableItems?.map(addRightClickEvent);

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
      if (item.id.startsWith(CLUSTER_SELECTOR_PREFIX) && (item as TreeViewDataItemWithHref).href)
        navigate((item as TreeViewDataItemWithHref).href);

      // wait for children elements to show
      setTimeout(() => {
        const allRightClickableItems = getAllRightClickableTreeViewItems([item]);

        const vmItems = getAllTreeViewVMItems([item]);
        const dropInnerElements = [
          ...getAllTreeViewFolderItems([item]),
          ...getAllTreeViewProjectItems([item]),
        ];

        vmItems?.forEach(addDragEventListener);

        dropInnerElements.forEach((element) => addDropEventListeners(element, removeFolderQuery));

        allRightClickableItems.forEach(addRightClickEvent);
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
