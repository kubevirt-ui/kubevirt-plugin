import { type TFunction } from 'i18next';

import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type Quantity } from '@kubevirt-utils/types/quantity';
import { convertToBaseValue, humanizeBinaryBytesWithoutB } from '@kubevirt-utils/utils/humanize.js';
import { type BinaryUnit, binaryUnitsOrdered } from '@kubevirt-utils/utils/unitConstants';
import {
  addByteSuffix,
  formatQuantityString,
  quantityToString,
  toQuantity,
} from '@kubevirt-utils/utils/units';

import { type V1DiskFormState } from '../../utils/types';
import { getDataVolumeTemplateSize } from '../utils/selectors';

export const getMinSizes = (size: string): Record<BinaryUnit, number> => {
  const sizeInBytes = convertToBaseValue(size) as null | number;
  if (!sizeInBytes && sizeInBytes !== 0) {
    return {} as Record<BinaryUnit, number>;
  }

  const result: Record<BinaryUnit, number> = {} as Record<BinaryUnit, number>;

  for (const unit of binaryUnitsOrdered) {
    result[unit] = (
      humanizeBinaryBytesWithoutB(sizeInBytes, null, unit) as { value: number }
    ).value;
  }

  return result;
};

export const getDiskSize = (diskState: V1DiskFormState, pvcSize: string): string =>
  getDataVolumeTemplateSize(diskState) ?? formatQuantityString(pvcSize) ?? '';

const getParsedSourceMinSize = (
  sourceMinSize: string | undefined,
): { minSizePerUnit: Record<BinaryUnit, number>; parsedMinSize: Quantity } | undefined => {
  if (!sourceMinSize) return undefined;

  const formattedMinSize = formatQuantityString(sourceMinSize);
  if (!formattedMinSize) return undefined;

  const parsedMinSize = toQuantity(formattedMinSize);
  if (!parsedMinSize) return undefined;

  return { minSizePerUnit: getMinSizes(formattedMinSize), parsedMinSize };
};

export const enforceMinDiskSize = (quantity: string, sourceMinSize: string | undefined): string => {
  const minSize = getParsedSourceMinSize(sourceMinSize);
  const parsedQuantity = toQuantity(quantity);

  if (!minSize || !parsedQuantity) return quantity;

  const minInCurrentUnit = Math.ceil(minSize.minSizePerUnit[parsedQuantity.unit as BinaryUnit]);

  return quantityToString({
    unit: parsedQuantity.unit,
    value: Math.max(parsedQuantity.value, minInCurrentUnit),
  });
};

export const isAtMinSize = (currentSize: string, sourceMinSize: string | undefined): boolean => {
  const minSize = getParsedSourceMinSize(sourceMinSize);
  if (!minSize) return false;

  const parsed = toQuantity(currentSize);

  if (!parsed) return false;

  return Math.ceil(minSize.minSizePerUnit[parsed.unit as BinaryUnit]) >= (parsed.value ?? 0);
};

export const getSourcePVCAndSnapshotIdentifiers = (
  diskState: V1DiskFormState,
  dataSource: undefined | V1beta1DataSource,
  namespace: string,
): {
  pvcName: string | undefined;
  pvcNamespace: string;
  snapName: string | undefined;
  snapNamespace: string;
} => {
  const clonePVCSource = diskState?.dataVolumeTemplate?.spec?.source?.pvc;
  const snapshotSource = diskState?.dataVolumeTemplate?.spec?.source?.snapshot;
  const pvcClaimName = diskState?.volume?.persistentVolumeClaim?.claimName;

  const dsSource = dataSource?.spec?.source;

  return {
    pvcName: dsSource?.pvc?.name ?? clonePVCSource?.name ?? pvcClaimName,
    pvcNamespace: dsSource?.pvc?.namespace ?? clonePVCSource?.namespace ?? namespace,
    snapName: dsSource?.snapshot?.name ?? snapshotSource?.name,
    snapNamespace: dsSource?.snapshot?.namespace ?? snapshotSource?.namespace ?? namespace,
  };
};

export const formatMinSizeHelperText = (
  sourceMinSize: string | undefined,
  t: TFunction,
): string | undefined => {
  const minSize = getParsedSourceMinSize(sourceMinSize);
  if (!minSize) return undefined;

  return t('Minimum disk size for this volume: {{value}} {{unit}}', {
    unit: addByteSuffix(minSize.parsedMinSize.unit),
    value: minSize.parsedMinSize.value,
  });
};
