import { useMemo } from 'react';

import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useIsACMPage from '@multicluster/useIsACMPage';

import { getSearchKeyBadges } from '../constants';
import { SearchKeyBadge } from '../types';

const useSearchKeyBadges = (): SearchKeyBadge[] => {
  const isACMPage = useIsACMPage();
  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
  return useMemo(
    () => getSearchKeyBadges(isACMPage, treeViewFoldersEnabled),
    [isACMPage, treeViewFoldersEnabled],
  );
};

export default useSearchKeyBadges;
