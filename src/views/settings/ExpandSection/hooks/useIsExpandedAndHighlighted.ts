import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';

import { idIsHighlighted } from '@kubevirt-utils/components/SearchItem/useIsHighlighted';
import { isSearchItemChildrenHighlighted } from '@settings/search/search';

type UseIsExpandedAndHighlightedReturn = {
  isExpanded: boolean;
  isHighlighted: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
};

const useIsExpandedAndHighlighted = (searchItemId?: string): UseIsExpandedAndHighlightedReturn => {
  const location = useLocation();

  const isHighlighted = useMemo(
    () => idIsHighlighted(searchItemId, location?.hash),
    [searchItemId, location?.hash],
  );
  const isChildrenHighlighted = useMemo(
    () => isSearchItemChildrenHighlighted(searchItemId, location?.hash),
    [searchItemId, location?.hash],
  );

  const [isExpanded, setIsExpanded] = useState(isHighlighted);

  useEffect(() => {
    if (isHighlighted || isChildrenHighlighted) {
      setIsExpanded(true);
    }
  }, [isHighlighted, isChildrenHighlighted, location?.hash]);

  return { isExpanded, isHighlighted, setIsExpanded };
};

export default useIsExpandedAndHighlighted;
