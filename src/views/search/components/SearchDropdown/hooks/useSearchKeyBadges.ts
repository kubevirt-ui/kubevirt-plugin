import { useMemo } from 'react';

import useIsACMPage from '@multicluster/useIsACMPage';

import { getSearchKeyBadges } from '../constants';
import { SearchKeyBadge } from '../types';

const useSearchKeyBadges = (): SearchKeyBadge[] => {
  const isACMPage = useIsACMPage();
  return useMemo(() => getSearchKeyBadges(isACMPage), [isACMPage]);
};

export default useSearchKeyBadges;
