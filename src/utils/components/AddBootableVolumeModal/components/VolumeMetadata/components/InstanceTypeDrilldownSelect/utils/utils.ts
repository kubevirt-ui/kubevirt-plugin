import { parseSize } from 'xbytes';

import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { getAnnotation, getLabel, getName } from '@kubevirt-utils/resources/shared';
import { APP_NAME_LABEL } from '@kubevirt-utils/resources/template';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  COMMON_INSTANCETYPES,
  initialMenuItems,
  INSTANCETYPE_CLASS_ANNOTATION,
  INSTANCETYPE_DESCRIPTION_ANNOTATION,
  instanceTypeSeriesNameMapper,
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

export const isRedHatInstanceType = (
  instanceType: V1beta1VirtualMachineClusterInstancetype,
): boolean => {
  if (getLabel(instanceType, APP_NAME_LABEL) !== COMMON_INSTANCETYPES) return false;

  const [seriesName, sizeLabel = ''] = getName(instanceType).split('.');

  const rhInstanceTypeSize = instanceTypeSeriesNameMapper[seriesName]?.possibleSizes?.find(
    (size) => size === sizeLabel,
  );

  return !isEmpty(rhInstanceTypeSize);
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
