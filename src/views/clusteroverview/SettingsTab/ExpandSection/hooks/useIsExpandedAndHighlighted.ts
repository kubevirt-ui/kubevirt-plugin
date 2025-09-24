import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { idIsHighlighted } from '@kubevirt-utils/components/SearchItem/useIsHighlighted';
import { isSearchItemChildrenHighlighted } from '@overview/SettingsTab/search/search';

const useIsExpandedAndHighlighted = (searchItemId?: string) => {
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
