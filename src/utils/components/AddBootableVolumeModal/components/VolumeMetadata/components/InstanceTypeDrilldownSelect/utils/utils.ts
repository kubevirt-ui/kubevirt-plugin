import { parseSize } from 'xbytes';

import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineInstancetype,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { getAnnotation, getLabel, getName } from '@kubevirt-utils/resources/shared';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  initialMenuItems,
  INSTANCETYPE_CLASS_ANNOTATION,
  INSTANCETYPE_DESCRIPTION_ANNOTATION,
  instanceTypeSeriesNameMapper,
  REDHAT_COM,
} from './constants';
import { InstanceTypeSize, InstanceTypesMenuItemsData, RedHatInstanceTypeSeries } from './types';

const getRedHatInstanceTypeSeriesAndSize = (
  instanceType: V1beta1VirtualMachineClusterInstancetype,
): { redHatITSeries: RedHatInstanceTypeSeries; size: InstanceTypeSize } => {
  const [seriesName, sizeLabel] = getName(instanceType).split('.');
  const cpus = instanceType?.spec?.cpu?.guest;
  const memory = readableSizeUnit(instanceType?.spec?.memory?.guest);

  const size: InstanceTypeSize = {
    cpus,
    memory,
    sizeLabel,
  };

  return {
    redHatITSeries: {
      classAnnotation: getAnnotation(instanceType, INSTANCETYPE_CLASS_ANNOTATION, seriesName),
      descriptionAnnotation: getAnnotation(instanceType, INSTANCETYPE_DESCRIPTION_ANNOTATION),
      seriesName,
      sizes: [size],
    },
    size,
  };
};

const hasRedHatSeriesSizeLabel = (
  instanceType: V1beta1VirtualMachineClusterInstancetype | V1beta1VirtualMachineInstancetype,
) => {
  const [seriesName, sizeLabel = ''] = getName(instanceType).split('.');

  const rhInstanceTypeSize = instanceTypeSeriesNameMapper[seriesName]?.possibleSizes?.find(
    (size) => size === sizeLabel,
  );

  return !isEmpty(rhInstanceTypeSize);
};

export const isRedHatInstanceType = (
  instanceType: V1beta1VirtualMachineClusterInstancetype | V1beta1VirtualMachineInstancetype,
): boolean => {
  if (getLabel(instanceType, VENDOR_LABEL) !== REDHAT_COM) return false;
  return hasRedHatSeriesSizeLabel(instanceType);
};

export const getInstanceTypeMenuItems = (
  instanceTypes: V1beta1VirtualMachineClusterInstancetype[],
): InstanceTypesMenuItemsData => {
  if (isEmpty(instanceTypes)) return initialMenuItems;

  const itemsData = instanceTypes.reduce((acc, it) => {
    if (!isRedHatInstanceType(it)) {
      !acc.userProvided.items.includes(getName(it)) && acc.userProvided.items.push(getName(it));
      return acc;
    }

    const { redHatITSeries, size } = getRedHatInstanceTypeSeriesAndSize(it);
    if (isEmpty(acc?.redHatProvided.items)) {
      acc.redHatProvided.items = [redHatITSeries];
      return acc;
    }

    const series = acc.redHatProvided.items.find(
      (item) => item.seriesName === redHatITSeries.seriesName,
    );

    if (!series) {
      acc.redHatProvided.items = [...acc?.redHatProvided.items, redHatITSeries];
      return acc;
    }

    const sizeNotExists = isEmpty(
      series.sizes.find((seriesSize) => isEqualObject(size, seriesSize)),
    );
    sizeNotExists && series.sizes.push(size);

    return acc;
  }, initialMenuItems);

  itemsData.redHatProvided.items = itemsData.redHatProvided.items.map((series) => ({
    ...series,
    sizes: series.sizes.sort((a, b) => parseSize(a?.memory) - parseSize(b?.memory)),
  }));

  return itemsData;
};
