import { type MouseEvent, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { tourContextMenuTriggerSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { useQueryParamsMethods } from '@kubevirt-utils/hooks/useQueryParamsMethods';
import { type TreeViewDataItem, type TreeViewProps } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { CLUSTER_SELECTOR_PREFIX } from '../utils/constants';
import {
  getAllRightClickableTreeViewItems,
  getAllTreeViewFolderItems,
  getAllTreeViewProjectItems,
  getAllTreeViewVMItems,
  type TreeViewDataItemWithHref,
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

  const { removeQueryArgumentValues } = useQueryParamsMethods();
  const navigate = useNavigate();

  const removeGroupValue = useCallback(
    (group: string) => removeQueryArgumentValues(VirtualMachineRowFilterType.Group, [group]),
    [removeQueryArgumentValues],
  );

  const dropElements = useMemo(
    () => [...getAllTreeViewFolderItems(treeData), ...getAllTreeViewProjectItems(treeData)],
    [treeData],
  );

  const addRightClickEvent = useCallback((treeItem: TreeViewDataItem): (() => void) => {
    const element = document.getElementById(treeItem.id);

    const handler = (event): void => {
      event.preventDefault();
      event.stopPropagation();
      document.body.click();
      setTriggerElement(element);
    };

    element?.addEventListener(RIGHT_CLICK_LISTENER, handler);

    return () => element?.removeEventListener(RIGHT_CLICK_LISTENER, handler);
  }, []);

  useLayoutEffect(() => {
    const allRightClickableItems = getAllRightClickableTreeViewItems(treeData);

    const removeRightClickListeners = allRightClickableItems?.map(addRightClickEvent);

    return (): void => {
      for (const removeListener of removeRightClickListeners ?? []) removeListener?.();
    };
  }, [treeData, addRightClickEvent]);

  useLayoutEffect(() => {
    const vmItems = getAllTreeViewVMItems(treeData);

    const removeDragListeners = vmItems?.map(addDragEventListener);

    return (): void => {
      for (const removeListener of removeDragListeners ?? []) removeListener?.();
    };
  }, [treeData, addRightClickEvent]);

  useLayoutEffect(() => {
    if (!dropElements) return;

    const removeEventListeners = dropElements.map((element) =>
      addDropEventListeners(element, removeGroupValue),
    );

    return (): void => {
      for (const removeEventListener of removeEventListeners ?? []) removeEventListener?.();
    };
  }, [dropElements, removeGroupValue]);

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

        for (const vmItem of vmItems ?? []) addDragEventListener(vmItem);

        for (const element of dropInnerElements) addDropEventListeners(element, removeGroupValue);

        for (const clickableItem of allRightClickableItems) addRightClickEvent(clickableItem);
      }, 200);
    },
    [addRightClickEvent, navigate, removeGroupValue],
  );

  useEffect(() => tourContextMenuTriggerSignal.subscribe(setTriggerElement), []);

  const hideMenu = useCallback(() => setTriggerElement(null), []);

  return {
    addListeners,
    hideMenu,
    triggerElement,
  };
};

export default useTreeViewItemActions;
