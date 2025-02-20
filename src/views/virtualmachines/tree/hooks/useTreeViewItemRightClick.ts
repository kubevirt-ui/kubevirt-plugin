import { useCallback, useLayoutEffect, useState } from 'react';

import { TreeViewDataItem } from '@patternfly/react-core';

type UseTreeViewItemRightClick = (treeData: TreeViewDataItem[]) => {
  hideMenu: () => void;
  triggeredVMName?: string;
  triggeredVMNamespace?: string;
  triggerElement: HTMLElement | null;
};

const useTreeViewItemRightClick: UseTreeViewItemRightClick = (treeData) => {
  const [triggerElement, setTriggerElement] = useState<HTMLElement>();

  useLayoutEffect(() => {
    const addRightClickEvent = (treeItem: TreeViewDataItem) => {
      if (!treeItem?.children) {
        const element = document.getElementById(treeItem.id);
        element?.addEventListener('contextmenu', (event) => {
          event.preventDefault();

          setTriggerElement(element);
        });
      }

      treeItem?.children?.map((item) => addRightClickEvent(item));
    };

    treeData?.map((item) => addRightClickEvent(item));
  }, [treeData]);

  const hideMenu = useCallback(() => setTriggerElement(null), []);

  const [namespace, name] = triggerElement?.id?.split('/') || ['', ''];

  return { hideMenu, triggeredVMName: name, triggeredVMNamespace: namespace, triggerElement };
};

export default useTreeViewItemRightClick;
