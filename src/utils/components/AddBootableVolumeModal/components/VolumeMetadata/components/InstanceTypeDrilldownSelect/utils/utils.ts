import { TFunction } from 'react-i18next';
import { parseSize } from 'xbytes';

import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getAnnotation, getLabel, getName } from '@kubevirt-utils/resources/shared';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  initialMenuItems,
  INSTANCETYPE_CLASS_ANNOTATION,
  INSTANCETYPE_CLASS_DISPLAY_NAME,
  INSTANCETYPE_DESCRIPTION_ANNOTATION,
  REDHAT_COM,
} from './constants';
import { InstanceTypeSize, InstanceTypesMenuItemsData, RedHatInstanceTypeSeries } from './types';

const getRedHatInstanceTypeSeriesAndSize = (
  instanceType: V1beta1VirtualMachineClusterInstancetype,
): { redHatITSeries: RedHatInstanceTypeSeries; size: InstanceTypeSize } => {
  const [seriesName, sizeLabel] = getName(instanceType).split('.');
  const cpus = instanceType?.spec?.cpu?.guest;
  const memory = readableSizeUnit(instanceType?.spec?.memory?.guest);
  const classAnnotation = getAnnotation(instanceType, INSTANCETYPE_CLASS_ANNOTATION, seriesName);

  const size: InstanceTypeSize = {
    cpus,
    memory,
    sizeLabel,
  };

  return {
    redHatITSeries: {
      classAnnotation,
      classDisplayNameAnnotation: getAnnotation(
        instanceType,
        INSTANCETYPE_CLASS_DISPLAY_NAME,
        classAnnotation,
      ),
      descriptionAnnotation: getAnnotation(instanceType, INSTANCETYPE_DESCRIPTION_ANNOTATION),
      seriesName,
      sizes: [size],
    },
    size,
  };
};

export const isRedHatInstanceType = (instanceType: InstanceTypeUnion): boolean =>
  getLabel(instanceType, VENDOR_LABEL) === REDHAT_COM;

export const getInstanceTypeMenuItems = (
  instanceTypes: V1beta1VirtualMachineClusterInstancetype[],
): InstanceTypesMenuItemsData => {
  if (isEmpty(instanceTypes)) return initialMenuItems;

  const itemsData = instanceTypes.reduce<InstanceTypesMenuItemsData>((acc, it) => {
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

export const isExistingInstanceType = (
  allInstanceTypes: InstanceTypeUnion[],
  selectedInstanceType: string,
  selectedInstanceTypeKind: string,
) =>
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
  const match = seriesName?.match(/^[a-zA-Z]+/);
  return match ? match[0].toUpperCase() : '';
};

export const getSeriesLabel = (seriesName: string, t: TFunction): string =>
  t('{{symbol}} series', { symbol: getSeriesSymbol(seriesName) });
