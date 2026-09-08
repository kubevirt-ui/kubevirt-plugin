import { type TFunction } from 'i18next';
import { parseSize } from 'xbytes';

import {
  INSTANCETYPE_CLASS_DISPLAY_NAME,
  INSTANCETYPE_DESCRIPTION_ANNOTATION,
} from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { isRedHatInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import {
  getInstanceTypeCPU,
  getInstanceTypeMemory,
} from '@kubevirt-utils/resources/instancetype/selectors';
import {
  type InstanceTypeSeries,
  type InstanceTypeSize,
  type InstanceTypeUnion,
} from '@kubevirt-utils/resources/instancetype/types';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';

import { type InstanceTypeRecord, type MappedInstanceTypes } from './types';

export const getInstanceTypeSizePrettyDisplay = (
  t: TFunction,
  instanceType: InstanceTypeUnion,
): string => {
  const name = getName(instanceType)?.split('.').pop() ?? getName(instanceType) ?? '';
  return `${name}: ${getInstanceTypeCPU(instanceType)} ${t('CPUs')}, ${getInstanceTypeMemory(instanceType)} ${t(
    'Memory',
  )}`;
};
export const getInstanceTypeClassDisplayAnnotation = (instanceType: InstanceTypeUnion): string => {
  return getAnnotation(instanceType, INSTANCETYPE_CLASS_DISPLAY_NAME);
};

export const getInstanceTypeDescriptionAnnotation = (instanceType: InstanceTypeUnion): string => {
  return getAnnotation(instanceType, INSTANCETYPE_DESCRIPTION_ANNOTATION);
};

export const getInstanceTypeSeriesAndSize = (
  instanceType: InstanceTypeUnion,
): { series?: InstanceTypeSeries; size?: InstanceTypeSize } => {
  const [series, size] = getName(instanceType)?.split('.') ?? [];
  if (!series || !size) {
    return {};
  }
  return { series: series as InstanceTypeSeries, size: size as InstanceTypeSize };
};

export const mappedInstanceTypesToSelectOptions = (
  t: TFunction,
  instanceTypes: InstanceTypeUnion[],
): MappedInstanceTypes =>
  instanceTypes.reduce((acc, instanceType) => {
    if (isRedHatInstanceType(instanceType)) {
      const { series, size } = getInstanceTypeSeriesAndSize(instanceType);
      if (!series || !size) {
        return acc;
      }
      acc[series] = {
        ...(acc[series] || {}),
        descriptionSeries: getInstanceTypeDescriptionAnnotation(instanceType),
        displayNameSeries: getInstanceTypeClassDisplayAnnotation(instanceType),
        sizes: {
          ...(acc?.[series]?.sizes || {}),
          [size]: {
            instanceType,
            prettyDisplaySize: getInstanceTypeSizePrettyDisplay(t, instanceType),
            series,
            seriesDisplayName: getInstanceTypeClassDisplayAnnotation(instanceType),
            size,
          },
        },
      };
    }
    return acc;
  }, {} as MappedInstanceTypes);

const sortInstanceTypeSizes = (a: InstanceTypeRecord, b: InstanceTypeRecord): number => {
  const aCPU = getInstanceTypeCPU(a.instanceType);
  const bCPU = getInstanceTypeCPU(b.instanceType);

  if (aCPU !== bCPU) return aCPU - bCPU;

  const aMemory = getInstanceTypeMemory(a.instanceType);
  const bMemory = getInstanceTypeMemory(b.instanceType);

  const bytesA = parseSize(`${aMemory}B`);
  const bytesB = parseSize(`${bMemory}B`);

  return bytesA - bytesB;
};

export const getInstanceTypesPrettyDisplaySize = (
  mappedInstanceTypes: MappedInstanceTypes,
  instanceTypeSeries?: InstanceTypeSeries,
  instanceTypeSize?: InstanceTypeSize,
): string | undefined => {
  if (!instanceTypeSeries || !instanceTypeSize) {
    return undefined;
  }
  return mappedInstanceTypes?.[instanceTypeSeries]?.sizes[instanceTypeSize]?.prettyDisplaySize;
};

export const getInstanceTypeSizes = (
  mappedInstanceTypes: MappedInstanceTypes,
  series?: string,
): InstanceTypeRecord[] => {
  const matchedSeries = Object.values(mappedInstanceTypes).find(
    (entry) => entry.displayNameSeries === series,
  );
  return Object.values(matchedSeries?.sizes ?? {}).sort(sortInstanceTypeSizes);
};

export const getInstanceTypeSeriesDisplayName = (
  mappedInstanceTypes: MappedInstanceTypes,
  instanceTypeSeries?: InstanceTypeSeries,
): string | undefined => {
  if (!instanceTypeSeries) {
    return undefined;
  }
  return mappedInstanceTypes?.[instanceTypeSeries]?.displayNameSeries;
};

export const getInstanceTypeFromSeriesAndSize = (
  mappedInstanceTypes: MappedInstanceTypes,
  instanceTypeSeries?: string,
  instanceTypeSize?: string,
): InstanceTypeUnion | undefined => {
  const allSeries = Object.values(mappedInstanceTypes);

  const matchedSeries = allSeries.find(
    (series) => series?.displayNameSeries === instanceTypeSeries,
  );

  if (!matchedSeries) {
    return undefined;
  }

  const matchedSize = Object.values(matchedSeries?.sizes ?? {}).find(
    (size) => size?.prettyDisplaySize === instanceTypeSize,
  );

  return matchedSize?.instanceType;
};
