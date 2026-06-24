import { useCallback, useEffect, useState } from 'react';

import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

type UseTokenOrderResult = {
  setTokenOrder: (order: string[]) => void;
  tokenOrder: string[];
  trackKey: (key: string) => void;
};

const useTokenOrder = (filters: KubevirtFilterState): UseTokenOrderResult => {
  const [tokenOrder, setTokenOrder] = useState<string[]>([]);

  useEffect(() => {
    setTokenOrder((prev) => prev.filter((key) => !isEmpty(filters[key])));
  }, [filters]);

  const trackKey = useCallback((key: string) => {
    setTokenOrder((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  return { setTokenOrder, tokenOrder, trackKey };
};

export default useTokenOrder;
