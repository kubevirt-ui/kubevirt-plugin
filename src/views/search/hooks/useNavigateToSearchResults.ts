import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import useVMSearchURL from '@multicluster/hooks/useVMSearchURL';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { generateQueryParams } from '@search/utils/query';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { AdvancedSearchQueryInputs } from '../utils/types';

type UseNavigateToSearchResults = (
  onFilterChange: OnFilterChange,
) => (searchInputs: AdvancedSearchQueryInputs) => void;

export const useNavigateToSearchResults: UseNavigateToSearchResults = (onFilterChange) => {
  const navigate = useNavigate();
  const searchURL = useVMSearchURL();
  const { setAllQueryArguments } = useQueryParamsMethods();

  const resetCurrentFilter = useCallback(() => {
    Object.values(VirtualMachineRowFilterType).forEach((type) => {
      if (type === VirtualMachineRowFilterType.Labels) {
        onFilterChange(type, { all: [] });
      } else {
        onFilterChange(type, { selected: [] });
      }
    });
  }, [onFilterChange]);

  const applyFilter = useCallback(
    (searchInputs: AdvancedSearchQueryInputs) => {
      resetCurrentFilter();

      const queryArgs = generateQueryParams(searchInputs);

      setAllQueryArguments(queryArgs);
    },
    [setAllQueryArguments, resetCurrentFilter],
  );

  return useCallback(
    (searchInputs: AdvancedSearchQueryInputs) => {
      navigate(searchURL);
      applyFilter(searchInputs);
    },
    [navigate, applyFilter, searchURL],
  );
};
