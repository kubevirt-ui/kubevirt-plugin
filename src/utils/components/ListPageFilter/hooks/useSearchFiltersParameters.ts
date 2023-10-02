import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useSearchFiltersParameters = () => {
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location]);

  const nameTextFilter = useMemo(() => queryParams.get('name'), [queryParams]);
  const labelTextFilters = useMemo(
    () => queryParams.get('labels')?.split(',') ?? [],
    [queryParams],
  );

  return { labels: labelTextFilters, name: nameTextFilter };
};
