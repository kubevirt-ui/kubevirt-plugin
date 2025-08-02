import { MouseEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { TEXT_FILTER_LABELS_ID } from '@virtualmachines/list/hooks/constants';

import { FOLDER_SELECTOR_PREFIX, VM_FOLDER_LABEL } from '../utils/constants';
import { TreeViewDataItemWithHref } from '../utils/utils';

const useTreeViewSelect = (
  onFilterChange: OnFilterChange,
): [
  selected: TreeViewDataItemWithHref,
  onSelect: (_event: MouseEvent, treeViewItem: TreeViewDataItemWithHref) => void,
  setSelected: (item: TreeViewDataItemWithHref) => void,
] => {
  const [selected, setSelected] = useState<TreeViewDataItemWithHref>(null);
  const navigate = useNavigate();
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();

  const onSelect = useCallback(
    (_event: MouseEvent, treeViewItem: TreeViewDataItemWithHref) => {
      setSelected(treeViewItem);
      navigate(treeViewItem.href);

      if (treeViewItem.id.startsWith(FOLDER_SELECTOR_PREFIX)) {
        const treeItemName = treeViewItem.name as string;
        setOrRemoveQueryArgument(TEXT_FILTER_LABELS_ID, `${VM_FOLDER_LABEL}=${treeItemName}`);
        return onFilterChange?.(TEXT_FILTER_LABELS_ID, {
          all: [`${VM_FOLDER_LABEL}=${treeItemName}`],
        });
      }
    },
    [navigate, onFilterChange, setOrRemoveQueryArgument],
  );

  return [selected, onSelect, setSelected];
};

export default useTreeViewSelect;
