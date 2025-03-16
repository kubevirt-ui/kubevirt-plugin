import { MouseEvent, useCallback, useLayoutEffect, useState } from 'react';

import { TreeViewDataItem, TreeViewProps } from '@patternfly/react-core';

import { getAllTreeViewVMsItems } from '../utils/utils';

type UseTreeViewItemRightClick = (treeData: TreeViewDataItem[]) => {
  addListenerToRightClick: TreeViewProps['onExpand'];
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const useTreeViewItemRightClick: UseTreeViewItemRightClick = (treeData) => {
  const [triggerElement, setTriggerElement] = useState<HTMLElement>();

  const addVMRightClickEvent = useCallback((treeItem: TreeViewDataItem): (() => void) => {
    const element = document.getElementById(treeItem.id);

    const handler = (event) => {
      event.preventDefault();
      setTriggerElement(element);
    };

    element?.addEventListener('contextmenu', handler);

    return () => element?.removeEventListener('contextmenu', handler);
  }, []);

  useLayoutEffect(() => {
    const vmItems = getAllTreeViewVMsItems(treeData);

    const removeListeners = vmItems?.map((item) => addVMRightClickEvent(item));

    return () => removeListeners?.forEach((removeListener) => removeListener());
  }, [treeData, addVMRightClickEvent]);

  const addListenerToRightClick = useCallback(
    (event: MouseEvent, item: TreeViewDataItem) => {
      const vmItems = getAllTreeViewVMsItems([item]);

      // wait for children elements to show
      setTimeout(() => vmItems?.forEach((vmItem) => addVMRightClickEvent(vmItem)), 200);
    },
    [addVMRightClickEvent],
  );

  const hideMenu = useCallback(() => setTriggerElement(null), []);

  return {
    addListenerToRightClick,
    hideMenu,
    triggerElement,
  };
};

export default useTreeViewItemRightClick;
