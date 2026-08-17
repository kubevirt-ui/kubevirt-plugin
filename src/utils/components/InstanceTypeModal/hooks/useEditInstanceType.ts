import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';

import { isRedHatInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
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

type UseEditInstanceTypeReturn = {
  mappedInstanceTypes: ReturnType<typeof mappedInstanceTypesToSelectOptions>;
  redHatProvided: boolean;
  selectedInstanceType: InstanceTypeUnion | undefined;
  selectedName: string | undefined;
  series: string | undefined;
  setRedHatProvided: Dispatch<SetStateAction<boolean>>;
  setSelectedName: Dispatch<SetStateAction<string | undefined>>;
  setSeries: Dispatch<SetStateAction<string | undefined>>;
  setSize: Dispatch<SetStateAction<string | undefined>>;
  size: string | undefined;
  userInstanceTypes: InstanceTypeUnion[];
};

const useEditInstanceType = ({
  allInstanceTypes,
  instanceType,
}: UseEditInstanceTypeProps): UseEditInstanceTypeReturn => {
  const { t } = useKubevirtTranslation();
  const [redHatProvided, setRedHatProvided] = useState<boolean>(() =>
    isRedHatInstanceType(instanceType),
  );

  const mappedInstanceTypes = useMemo(
    () => mappedInstanceTypesToSelectOptions(t, allInstanceTypes),
    [t, allInstanceTypes],
  );

  const userInstanceTypes = useMemo(
    () => allInstanceTypes.filter((item) => !isRedHatInstanceType(item)),
    [allInstanceTypes],
  );

  const [selectedName, setSelectedName] = useState<string | undefined>(() =>
    isRedHatInstanceType(instanceType) ? undefined : getName(instanceType),
  );

  const { series: instanceTypeSeries, size: instanceTypeSize } = useMemo(
    () => getInstanceTypeSeriesAndSize(instanceType),
    [instanceType],
  );

  const [series, setSeries] = useState<string | undefined>(() =>
    getInstanceTypeSeriesDisplayName(mappedInstanceTypes, instanceTypeSeries),
  );

  const [size, setSize] = useState<string | undefined>(() =>
    getInstanceTypesPrettyDisplaySize(mappedInstanceTypes, instanceTypeSeries, instanceTypeSize),
  );

  const selectedInstanceType = useMemo(() => {
    if (redHatProvided) {
      return getInstanceTypeFromSeriesAndSize(mappedInstanceTypes, series, size);
    }
    return userInstanceTypes.find((item) => getName(item) === selectedName);
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
