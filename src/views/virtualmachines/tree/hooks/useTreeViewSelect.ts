import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom-v5-compat';

import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { useLastNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { TEXT_FILTER_LABELS_ID } from '@virtualmachines/list/hooks/constants';

import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
  VM_FOLDER_LABEL,
} from '../utils/constants';
import { treeDataMap, TreeViewDataItemWithHref } from '../utils/utils';

const useTreeViewSelect = (
  onFilterChange: OnFilterChange,
): [
  selected: TreeViewDataItemWithHref,
  onSelect: (_event: MouseEvent, treeViewItem: TreeViewDataItemWithHref) => void,
] => {
  const location = useLocation();
  const { ns } = useParams<{ ns: string }>();
  const [searchParams] = useSearchParams();
  const dataMap = treeDataMap.value;

  const [selected, setSelected] = useState<TreeViewDataItemWithHref>(null);

  const navigate = useNavigate();
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();
  const [_, setLastNamespace] = useLastNamespace();

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

  // Apply the selected item when reloading the page / creating project / creating VM / deleting VM
  useEffect(() => {
    if (isEmpty(selected) || location.pathname !== selected.href) {
      if (!ns) {
        setSelected(dataMap?.[ALL_NAMESPACES_SESSION_KEY]);
        setLastNamespace(ALL_NAMESPACES);
        return;
      }

      setLastNamespace(ns);
      const labelsParam = searchParams?.get('labels');
      if (labelsParam?.startsWith(VM_FOLDER_LABEL)) {
        const [__, folder] = labelsParam.split('=');
        setSelected(dataMap?.[`${FOLDER_SELECTOR_PREFIX}/${ns}/${folder}`]);

        return;
      }

      const currentPageVMName = location.pathname.split('/')[5];

      if (currentPageVMName) {
        setSelected(dataMap?.[`${ns}/${currentPageVMName}`]);
        return;
      }
      return setSelected(dataMap?.[`${PROJECT_SELECTOR_PREFIX}/${ns}`]);
    }
  }, [dataMap, location.pathname, ns, searchParams, selected, setLastNamespace]);

  return [selected, onSelect];
};

export default useTreeViewSelect;
