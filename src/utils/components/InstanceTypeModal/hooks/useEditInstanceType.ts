import { useMemo, useState } from 'react';

import { isRedHatInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getName } from '@kubevirt-utils/resources/shared';

import {
  getInstanceTypeFromSeriesAndSize,
  getInstanceTypeSeriesAndSize,
  getInstanceTypeSeriesDisplayName,
  getInstanceTypesPrettyDisplaySize,
  mappedInstanceTypesToSelectOptions,
} from '../utils/util';

type UseEditInstanceTypeProps = {
  allInstanceTypes: InstanceTypeUnion[];
  instanceType: InstanceTypeUnion;
};

const useEditInstanceType = ({ allInstanceTypes, instanceType }: UseEditInstanceTypeProps) => {
  const [redHatProvided, setRedHatProvided] = useState<boolean>(isRedHatInstanceType(instanceType));

  const mappedInstanceTypes = useMemo(
    () => mappedInstanceTypesToSelectOptions(allInstanceTypes),
    [allInstanceTypes],
  );

  const userInstanceTypes = useMemo(
    () => allInstanceTypes.filter((it) => !isRedHatInstanceType(it)),
    [allInstanceTypes],
  );

  const [selectedName, setSelectedName] = useState<string | undefined>(
    isRedHatInstanceType(instanceType) ? undefined : getName(instanceType),
  );

  const { series: instanceTypeSeries, size: instanceTypeSize } = useMemo(
    () => getInstanceTypeSeriesAndSize(instanceType),
    [instanceType],
  );

  const [series, setSeries] = useState<string | undefined>(
    getInstanceTypeSeriesDisplayName(mappedInstanceTypes, instanceTypeSeries),
  );

  const [size, setSize] = useState<string | undefined>(
    getInstanceTypesPrettyDisplaySize(mappedInstanceTypes, instanceTypeSeries, instanceTypeSize),
  );

  const selectedInstanceType = useMemo(() => {
    if (redHatProvided) {
      return getInstanceTypeFromSeriesAndSize(mappedInstanceTypes, series, size);
    }
    return userInstanceTypes.find((it) => getName(it) === selectedName);
  }, [redHatProvided, series, size, userInstanceTypes, selectedName, mappedInstanceTypes]);

  return {
    mappedInstanceTypes,
    redHatProvided,
    selectedInstanceType,
    selectedName,
    series,
    setRedHatProvided,
    setSelectedName,
    setSeries,
    setSize,
    size,
    userInstanceTypes,
  };
};

export default useEditInstanceType;
