import { MouseEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { logTreeViewAction } from '@kubevirt-utils/extensions/telemetry/multicluster';
import { TELEMETRY_TREE_VIEW_ACTION } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';

import { FOLDER_SELECTOR_PREFIX } from '../utils/constants';
import { TreeViewDataItemWithHref } from '../utils/utils';

import { appendFolderLabelParam } from './utils';

const useTreeViewSelect = (): [
  selected: TreeViewDataItemWithHref,
  onSelect: (_event: MouseEvent, treeViewItem: TreeViewDataItemWithHref) => void,
  setSelected: (item: TreeViewDataItemWithHref) => void,
] => {
  const [selected, setSelected] = useState<TreeViewDataItemWithHref>(null);
  const navigate = useNavigate();

  const onSelect = useCallback(
    (_event: MouseEvent, treeViewItem: TreeViewDataItemWithHref) => {
      setSelected(treeViewItem);
      logTreeViewAction(
        treeViewItem.href ? TELEMETRY_TREE_VIEW_ACTION.NAVIGATE : TELEMETRY_TREE_VIEW_ACTION.FILTER,
      );

      if (treeViewItem.id.startsWith(FOLDER_SELECTOR_PREFIX)) {
        const folderName = treeViewItem.name as string;
        return navigate(appendFolderLabelParam(treeViewItem.href, folderName));
      }

      if (treeViewItem.href) navigate(treeViewItem.href);
    },
    [navigate],
  );

  return [selected, onSelect, setSelected];
};

export default useTreeViewSelect;
