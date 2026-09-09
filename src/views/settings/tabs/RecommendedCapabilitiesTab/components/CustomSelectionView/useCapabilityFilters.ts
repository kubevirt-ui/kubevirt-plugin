import { useMemo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useDataViewFilters } from '@patternfly/react-data-view';

import {
  type CapabilityFeature,
  type CapabilityFilterValues,
  type CapabilityInstallState,
} from '../../utils/types';
import { matchesName, matchesStatus } from './utils';

const INITIAL_FILTERS: CapabilityFilterValues = {
  name: '',
  status: [],
};

export const useCapabilityFilters = (
  features: CapabilityFeature[],
  getCapabilityInstallState: (feature: CapabilityFeature) => CapabilityInstallState,
): {
  clearAllFilters: () => void;
  filteredData: CapabilityFeature[];
  filters: CapabilityFilterValues;
  onSetFilters: ReturnType<typeof useDataViewFilters<CapabilityFilterValues>>['onSetFilters'];
} => {
  const { clearAllFilters, filters, onSetFilters } = useDataViewFilters<CapabilityFilterValues>({
    initialFilters: INITIAL_FILTERS,
  });

  const filteredData = useMemo(
    () =>
      features.filter(
        (feature) =>
          (!filters.name || matchesName(feature, filters.name)) &&
          (isEmpty(filters.status) ||
            matchesStatus(feature, filters.status, getCapabilityInstallState)),
      ),
    [features, filters, getCapabilityInstallState],
  );

  return { clearAllFilters, filteredData, filters, onSetFilters };
};
