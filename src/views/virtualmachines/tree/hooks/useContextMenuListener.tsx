import { useCallback, useLayoutEffect, useState } from 'react';

import { TreeViewDataItem } from '@patternfly/react-core';

type UseContextMenuListenerType = (
  treeData: TreeViewDataItem[],
) => [triggerElement: HTMLElement | null, hide: () => void];

const useContextMenuListener: UseContextMenuListenerType = (treeData) => {
  const [trigger, setTrigger] = useState<HTMLElement>();

  useLayoutEffect(() => {
    const addRightClickEvent = (treeItem: TreeViewDataItem) => {
      if (!treeItem?.children) {
        const element = document.getElementById(treeItem.id);
        element?.addEventListener('contextmenu', (event) => {
          event.preventDefault();

          setTrigger(element);
        });
      }

      treeItem?.children?.map((item) => addRightClickEvent(item));
    };

    treeData?.map((item) => addRightClickEvent(item));
  }, [treeData]);

  const hideMenu = useCallback(() => setTrigger(null), []);

  return [trigger, hideMenu];
};

export default useContextMenuListener;
