import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useVMSearchURL from '@multicluster/hooks/useVMSearchURL';
import { generateQueryParams } from '@search/utils/query';

import { AdvancedSearchQueryInputs } from '../utils/types';

type UseNavigateToSearchResults = (
  onSetFilters: OnSetFilters,
  clearAllFilters: () => void,
) => (searchInputs: AdvancedSearchQueryInputs) => void;

export const useNavigateToSearchResults: UseNavigateToSearchResults = (
  onSetFilters,
  clearAllFilters,
) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchURL = useVMSearchURL();

  const isOnSearchResultsPage = location.pathname.endsWith(searchURL);

  return useCallback(
    (searchInputs: AdvancedSearchQueryInputs) => {
      const queryArgs = generateQueryParams(searchInputs);

      if (isOnSearchResultsPage) {
        clearAllFilters();
        onSetFilters(queryArgs);
        return;
      }

      const params = new URLSearchParams();

      Object.entries(queryArgs).forEach(([key, values]) => {
        values.forEach((value) => {
          params.append(key, value);
        });
      });
      const queryString = params.toString();

      navigate(queryString ? `${searchURL}?${queryString}` : searchURL);
    },
    [navigate, searchURL, onSetFilters, clearAllFilters, isOnSearchResultsPage],
  );
};
