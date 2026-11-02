import { useMemo } from 'react';

import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import { getInstanceTypePrefix } from '@kubevirt-utils/resources/bootableresources/helpers';
import { type InstanceTypeSeriesName } from '@kubevirt-utils/resources/instancetype/types';

import { type MappedInstanceTypes } from '../utils/types';

type UseVisibleInstanceTypeSeriesEntriesParams = {
  cluster?: string;
  instanceTypeName?: string;
  mappedInstanceTypes: MappedInstanceTypes;
};

export type VisibleInstanceTypeSeriesEntry = [string, MappedInstanceTypes[InstanceTypeSeriesName]];

const useVisibleInstanceTypeSeriesEntries = ({
  cluster,
  instanceTypeName,
  mappedInstanceTypes,
}: UseVisibleInstanceTypeSeriesEntriesParams): VisibleInstanceTypeSeriesEntry[] => {
  const { isFamilyVisible, loaded } = useDisabledInstanceTypeFamilies(cluster);
  const preserveFamily = instanceTypeName ? getInstanceTypePrefix(instanceTypeName) : undefined;

  return useMemo(() => {
    if (!loaded) {
      return [];
    }
    return Object.entries(mappedInstanceTypes).filter(([seriesKey]) =>
      isFamilyVisible(seriesKey, preserveFamily),
    );
  }, [isFamilyVisible, loaded, mappedInstanceTypes, preserveFamily]);
};

export default useVisibleInstanceTypeSeriesEntries;
