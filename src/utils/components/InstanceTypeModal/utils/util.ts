import { InstanceTypeSize } from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/utils/types';
import {
  INSTANCETYPE_CLASS_DISPLAY_NAME,
  INSTANCETYPE_DESCRIPTION_ANNOTATION,
  REDHAT_COM,
} from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getLabel } from '@kubevirt-utils/resources/shared';
import { InstanceTypeUnion } from '@virtualmachines/details/tabs/configuration/utils/types';

import { InstanceTypesSeries, InstanceTypesSizes, MappedInstanceTypes } from './types';

export const getInstanceTypeItemSizePrettyDisplay = (it: InstanceTypeUnion): string =>
  `${it?.metadata.name.split('.').pop()}: ${it?.spec?.cpu?.guest} ${t('CPUs')}, ${
    it?.spec?.memory?.guest
  } ${t('Memory')}`;

export const getInstanceTypeClassDisplayAnnotation = (instanceType: InstanceTypeUnion): string => {
  return getAnnotation(instanceType, INSTANCETYPE_CLASS_DISPLAY_NAME);
};

export const getInstanceTypeDescriptionAnnotation = (instanceType: InstanceTypeUnion): string => {
  return getAnnotation(instanceType, INSTANCETYPE_DESCRIPTION_ANNOTATION);
};

export const getInstanceTypeSeriesAndSize = (
  instanceType: InstanceTypeUnion,
): { series: InstanceTypesSeries; size: InstanceTypesSizes } => {
  const [series, size] = instanceType?.metadata?.name?.split('.');
  return { series: series as InstanceTypesSeries, size: size as InstanceTypesSizes };
};

export const mappedInstanceTypesToSelectOptions = (
  instanceTypes: InstanceTypeUnion[],
): MappedInstanceTypes =>
  instanceTypes.reduce((acc, it) => {
    if (getLabel(it, VENDOR_LABEL) === REDHAT_COM) {
      const { series, size } = getInstanceTypeSeriesAndSize(it);
      acc[series] = {
        ...(acc[series] || {}),
        descriptionSeries: getInstanceTypeDescriptionAnnotation(it),
        displayNameSeries: getInstanceTypeClassDisplayAnnotation(it),
        sizes: {
          ...(acc?.[series]?.sizes || {}),
          [size]: {
            instanceType: it,
            prettyDisplaySize: getInstanceTypeItemSizePrettyDisplay(it),
            series,
            seriesDisplayName: getInstanceTypeClassDisplayAnnotation(it),
            size,
          },
        },
      };
    }
    return acc;
  }, {} as MappedInstanceTypes);

export const getInstanceTypesPrettyDisplaySize = (
  mappedInstanceTypes: MappedInstanceTypes,
  instanceTypeSeries: InstanceTypesSeries,
  instanceTypeSize: InstanceTypeSize,
) => mappedInstanceTypes?.[instanceTypeSeries]?.sizes[instanceTypeSize]?.prettyDisplaySize;

export const getInstanceTypesSizes = (mappedInstanceTypes: MappedInstanceTypes, series: string) => {
  const matchedSeries = Object.values(mappedInstanceTypes).find(
    (it) => it.displayNameSeries === series,
  );
  return Object.values(matchedSeries?.sizes);
};

export const getInstanceTypeSeriesDisplayName = (
  mappedInstanceTypes: MappedInstanceTypes,
  instanceTypeSeries: InstanceTypesSeries,
) => mappedInstanceTypes?.[instanceTypeSeries]?.displayNameSeries;

export const getInstanceTypeFromSeriesAndSize = (
  mappedInstanceTypes: MappedInstanceTypes,
  instanceTypeSeries: string,
  instanceTypeSize: string,
): InstanceTypeUnion => {
  const instanceTypesSeries = Object.values(mappedInstanceTypes);

  const matchedSeries = instanceTypesSeries.find(
    (series) => series.displayNameSeries === instanceTypeSeries,
  );
  const matchedSize = Object.values(matchedSeries?.sizes).find(
    (size) => size.prettyDisplaySize === instanceTypeSize,
  );

  return matchedSize?.instanceType;
};
