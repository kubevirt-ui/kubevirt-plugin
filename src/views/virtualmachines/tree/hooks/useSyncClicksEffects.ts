import { useEffect } from 'react';
import { Location } from 'react-router-dom-v5-compat';

import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

import { FOLDER_SELECTOR_PREFIX, PROJECT_SELECTOR_PREFIX } from '../utils/constants';
import { setSelectedTreeItem, treeDataMap } from '../utils/utils';

export const useSyncClicksEffects = (
  activeNamespace: string,
  loaded: boolean,
  location: Location<any>,
) => {
  useEffect(() => {
    const pathname = location.pathname;
    if (loaded) {
      const dataMap = treeDataMap.value;
      if (pathname.startsWith(`/k8s/${ALL_NAMESPACES}`)) {
        setSelectedTreeItem(dataMap[ALL_NAMESPACES_SESSION_KEY]);
        return;
      }

      const vmName = pathname.split('/')[5];
      if (vmName) {
        setSelectedTreeItem(dataMap[`${activeNamespace}/${vmName}`]);
        return;
      }

      const queryParams = new URLSearchParams(location.search);
      const folderFilterName = queryParams.get('labels')?.split('=')?.[1];
      if (folderFilterName) {
        setSelectedTreeItem(
          dataMap[`${FOLDER_SELECTOR_PREFIX}/${activeNamespace}/${folderFilterName}`],
        );
        return;
      }

      setSelectedTreeItem(dataMap[`${PROJECT_SELECTOR_PREFIX}/${activeNamespace}`]);
    }
  }, [activeNamespace, loaded, location.search, location.pathname]);
};
