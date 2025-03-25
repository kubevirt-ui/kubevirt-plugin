import { parseSize } from 'xbytes';

import {
  INSTANCETYPE_CLASS_DISPLAY_NAME,
  INSTANCETYPE_DESCRIPTION_ANNOTATION,
  REDHAT_COM,
} from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getInstanceTypeCPU,
  getInstanceTypeMemory,
} from '@kubevirt-utils/resources/instancetype/selectors';
import {
  InstanceTypeSeries,
  InstanceTypeSize,
  InstanceTypeUnion,
} from '@kubevirt-utils/resources/instancetype/types';
import { getAnnotation, getLabel, getName } from '@kubevirt-utils/resources/shared';

import { InstanceTypeRecord, MappedInstanceTypes } from './types';

export const getInstanceTypeSizePrettyDisplay = (it: InstanceTypeUnion): string => {
  const name = getName(it)?.split('.').pop() ?? getName(it) ?? '';
  return `${name}: ${getInstanceTypeCPU(it)} ${t('CPUs')}, ${getInstanceTypeMemory(it)} ${t(
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
  instanceTypes: InstanceTypeUnion[],
): MappedInstanceTypes =>
  instanceTypes.reduce((acc, it) => {
    if (getLabel(it, VENDOR_LABEL) === REDHAT_COM) {
      const { series, size } = getInstanceTypeSeriesAndSize(it);
      if (!series || !size) {
        return acc;
      }
      acc[series] = {
        ...(acc[series] || {}),
        descriptionSeries: getInstanceTypeDescriptionAnnotation(it),
        displayNameSeries: getInstanceTypeClassDisplayAnnotation(it),
        sizes: {
          ...(acc?.[series]?.sizes || {}),
          [size]: {
            instanceType: it,
            prettyDisplaySize: getInstanceTypeSizePrettyDisplay(it),
            series,
            seriesDisplayName: getInstanceTypeClassDisplayAnnotation(it),
            size,
          },
        },
      };
    }
    return acc;
  }, {} as MappedInstanceTypes);

const sortInstanceTypeSizes = (a: InstanceTypeRecord, b: InstanceTypeRecord) => {
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
) => {
  if (!instanceTypeSeries || !instanceTypeSize) {
    return undefined;
  }
  return mappedInstanceTypes?.[instanceTypeSeries]?.sizes[instanceTypeSize]?.prettyDisplaySize;
};

export const getInstanceTypeSizes = (mappedInstanceTypes: MappedInstanceTypes, series?: string) => {
  const matchedSeries = Object.values(mappedInstanceTypes).find(
    (it) => it.displayNameSeries === series,
  );
  return Object.values(matchedSeries?.sizes ?? {}).sort(sortInstanceTypeSizes);
};

export const getInstanceTypeSeriesDisplayName = (
  mappedInstanceTypes: MappedInstanceTypes,
  instanceTypeSeries?: InstanceTypeSeries,
) => {
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
  const itSeries = Object.values(mappedInstanceTypes);

  const matchedSeries = itSeries.find((series) => series?.displayNameSeries === instanceTypeSeries);

  if (!matchedSeries) {
    return undefined;
  }

  const matchedSize = Object.values(matchedSeries?.sizes ?? {}).find(
    (size) => size?.prettyDisplaySize === instanceTypeSize,
  );

  return matchedSize?.instanceType;
};
