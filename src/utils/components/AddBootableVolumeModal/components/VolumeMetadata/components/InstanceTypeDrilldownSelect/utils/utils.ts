import { type TFunction } from 'i18next';
import { parseSize } from 'xbytes';

import { type V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getAnnotation, getLabel, getName } from '@kubevirt-utils/resources/shared';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  initialMenuItems,
  INSTANCETYPE_CLASS_DISPLAY_NAME,
  INSTANCETYPE_CLASS_LABEL,
  INSTANCETYPE_DESCRIPTION_ANNOTATION,
  INSTANCETYPE_SIZE_LABEL,
  KUBEVIRT_IO,
  REDHAT_COM,
} from './constants';
import {
  type InstanceTypeSeries,
  type InstanceTypeSize,
  type InstanceTypesMenuItemsData,
  type RedHatInstanceTypeSeries,
} from './types';

const getInstanceTypeSeries = (
  instanceType: V1beta1VirtualMachineClusterInstancetype,
): InstanceTypeSeries => {
  const [seriesFromName, sizeFromName] = getName(instanceType)?.split('.') ?? [];
  const classLabel = getLabel(instanceType, INSTANCETYPE_CLASS_LABEL) ?? seriesFromName ?? '';
  const sizeLabel = getLabel(instanceType, INSTANCETYPE_SIZE_LABEL) ?? sizeFromName ?? '';

  const descriptionAnnotation = getAnnotation(instanceType, INSTANCETYPE_DESCRIPTION_ANNOTATION);
  const classDisplayNameAnnotation = getAnnotation(
    instanceType,
    INSTANCETYPE_CLASS_DISPLAY_NAME,
    classLabel,
  );

  const cpus = instanceType?.spec?.cpu?.guest;
  const memory = readableSizeUnit(instanceType?.spec?.memory?.guest);

  const size: InstanceTypeSize = {
    cpus,
    memory,
    sizeLabel,
  };

  return {
    classDisplayNameAnnotation,
    classLabel,
    descriptionAnnotation,
    sizes: [size],
  };
};

const getRedHatInstanceTypeSeries = (
  instanceType: V1beta1VirtualMachineClusterInstancetype,
): RedHatInstanceTypeSeries => {
  const [seriesName] = getName(instanceType).split('.');

  const instanceTypeSeries = getInstanceTypeSeries(instanceType);

  return {
    ...instanceTypeSeries,
    seriesName,
  };
};

export const isRedHatInstanceType = (instanceType: InstanceTypeUnion): boolean =>
  [KUBEVIRT_IO, REDHAT_COM].includes(getLabel(instanceType, VENDOR_LABEL));

const mergeSeries = (items: InstanceTypeSeries[], newSeries: InstanceTypeSeries): void => {
  const existingSeries = items.find((item) => item.classLabel === newSeries.classLabel);

  if (!existingSeries) {
    items.push(newSeries);
    return;
  }

  const newSize = newSeries.sizes[0];
  const isSizeExisting = existingSeries.sizes.some((size) => isEqualObject(newSize, size));

  if (!isSizeExisting) {
    existingSeries.sizes.push(newSize);
  }
};

export const getInstanceTypeMenuItems = (
  instanceTypes: V1beta1VirtualMachineClusterInstancetype[],
): InstanceTypesMenuItemsData => {
  if (isEmpty(instanceTypes)) return initialMenuItems;

  const itemsData = instanceTypes.reduce<InstanceTypesMenuItemsData>((acc, instanceType) => {
    if (!isRedHatInstanceType(instanceType)) {
      const instanceTypeName = getName(instanceType) ?? '';
      if (!acc.userProvided.items.includes(instanceTypeName)) {
        acc.userProvided.items.push(instanceTypeName);
      }
      return acc;
    }

    const redHatITSeries = getRedHatInstanceTypeSeries(instanceType);
    mergeSeries(acc.redHatProvided.items, redHatITSeries);

    return acc;
  }, initialMenuItems);

  itemsData.redHatProvided.items = itemsData.redHatProvided.items.map((series) => ({
    ...series,
    sizes: [...series.sizes].sort((a, b) => parseSize(a?.memory) - parseSize(b?.memory)),
  }));

  return itemsData;
};

export const isExistingInstanceType = (
  allInstanceTypes: InstanceTypeUnion[],
  selectedInstanceType: string,
  selectedInstanceTypeKind: string,
): boolean =>
  allInstanceTypes.some(
    (instanceType) =>
      getName(instanceType) === selectedInstanceType &&
      instanceType.kind === selectedInstanceTypeKind,
  );

export const seriesHasHugepagesVariant = (seriesName: string): boolean =>
  seriesName === 'cx1' || seriesName === 'm1';

export const is1GiInstanceType = (sizeLabel: string): boolean => sizeLabel.endsWith('1gi');

// Converts series name to symbol (e.g. cx1 -> CX, d1 -> D, etc.)
export const getSeriesSymbol = (seriesName: string): string => {
  const match = /^[a-zA-Z]+/.exec(seriesName);
  return match ? match[0].toUpperCase() : '';
};

export const getSeriesLabel = (seriesName: string, t: TFunction): string =>
  t('{{symbol}} series', { symbol: getSeriesSymbol(seriesName) });
