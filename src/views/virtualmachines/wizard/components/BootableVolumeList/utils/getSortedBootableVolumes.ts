import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import {
  getBootableVolumePVCSource,
  getDataVolumeForPVC,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import {
  getDiskSize,
  getPVCStorageClassName,
  getVolumeSnapshotStorageClass,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getAnnotation, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getOSFromDefaultPreference } from '@virtualmachines/wizard/components/BootableVolumeList/utils/utils';
import { type BootVolumeTableRow } from '@virtualmachines/wizard/utils/types';

import { type BootableVolumeResolvedSources, type BootableVolumeSortContext } from '../types';

type BootableVolumeSourcesContext = Pick<
  BootableVolumeSortContext,
  'dvSources' | 'pvcSources' | 'volumeSnapshotSources'
>;

const getBootableVolumeResolvedSources = (
  bootableVolume: BootableVolume,
  { dvSources, pvcSources, volumeSnapshotSources }: BootableVolumeSourcesContext,
): BootableVolumeResolvedSources => {
  const pvcSource: IoK8sApiCoreV1PersistentVolumeClaim | null = getBootableVolumePVCSource(
    bootableVolume,
    pvcSources,
  );
  const dvSource = getDataVolumeForPVC(pvcSource, dvSources) as null | V1beta1DataVolume;

  return {
    dvSource,
    pvcSource,
    volumeSnapshotSource: volumeSnapshotSources?.[getName(bootableVolume)] as VolumeSnapshotKind,
  };
};

export const getBootableVolumeSortDiskSize = (
  bootableVolume: BootableVolume,
  context: BootableVolumeSourcesContext,
): string => {
  const { dvSource, pvcSource, volumeSnapshotSource } = getBootableVolumeResolvedSources(
    bootableVolume,
    context,
  );

  return getDiskSize(dvSource, pvcSource, volumeSnapshotSource);
};

export const getBootableVolumeSortStorageClass = (
  bootableVolume: BootableVolume,
  context: BootableVolumeSourcesContext,
): string => {
  const { pvcSource, volumeSnapshotSource } = getBootableVolumeResolvedSources(
    bootableVolume,
    context,
  );

  return getPVCStorageClassName(pvcSource) ?? getVolumeSnapshotStorageClass(volumeSnapshotSource);
};

export type BootableVolumeSortValueGetter = (row: BootVolumeTableRow) => string;

export const getBootableVolumeSortCriteria = (
  context: BootableVolumeSortContext,
): { columnIndex: number; columnToSortBy: BootableVolumeSortValueGetter }[] => [
  { columnIndex: 0, columnToSortBy: (row) => getName(row.volume) },
  { columnIndex: 1, columnToSortBy: (row) => row.variant },
  ...(context.includeNamespaceColumn
    ? [{ columnIndex: 2, columnToSortBy: (row: BootVolumeTableRow) => getNamespace(row.volume) }]
    : []),
  {
    columnIndex: 3,
    columnToSortBy: (row) =>
      getOSFromDefaultPreference(
        row.volume,
        context.clusterPreferencesMap,
        context.userPreferencesMap,
      ),
  },
  {
    columnIndex: 4,
    columnToSortBy: (row) => getBootableVolumeSortStorageClass(row.volume, context),
  },
  {
    columnIndex: 5,
    columnToSortBy: (row) => getBootableVolumeSortDiskSize(row.volume, context),
  },
  {
    columnIndex: 6,
    columnToSortBy: (row) => getAnnotation(row.volume, ANNOTATIONS.description),
  },
];

type SortDirection = 'asc' | 'desc';

export type BootableVolumeSortCriterion = {
  columnIndex: number;
  direction: SortDirection;
};

const sortByAscDirection = (firstValue: string, secondValue: string): number =>
  (firstValue ?? '').localeCompare(secondValue ?? '', undefined, {
    numeric: true,
    sensitivity: 'base',
  });

const sortByDescDirection = (firstValue: string, secondValue: string): number =>
  (secondValue ?? '').localeCompare(firstValue ?? '', undefined, {
    numeric: true,
    sensitivity: 'base',
  });

const sortFunctionByDirection: Record<
  SortDirection,
  (firstValue: string, secondValue: string) => number
> = {
  asc: sortByAscDirection,
  desc: sortByDescDirection,
};

const sortBootableVolumesByCriterion = (
  rows: BootVolumeTableRow[],
  sortCriteria: BootableVolumeSortCriterion,
  columnToSortBy: BootableVolumeSortValueGetter,
): BootVolumeTableRow[] =>
  [...rows].sort((firstRow, secondRow) => {
    const firstColumnValue = columnToSortBy(firstRow);
    const secondColumnValue = columnToSortBy(secondRow);

    return sortFunctionByDirection[sortCriteria.direction](firstColumnValue, secondColumnValue);
  });

export const sortBootableVolumesWithColumnGetters = (
  rows: BootVolumeTableRow[],
  sortCriteria: BootableVolumeSortCriterion,
  context: BootableVolumeSortContext,
): BootVolumeTableRow[] => {
  if (isEmpty(sortCriteria)) {
    return [...rows];
  }

  const sortCriterion = getBootableVolumeSortCriteria(context).find(
    (criteria) => criteria.columnIndex === sortCriteria.columnIndex,
  );

  if (!sortCriterion) {
    return [...rows];
  }

  return sortBootableVolumesByCriterion(rows, sortCriteria, sortCriterion.columnToSortBy);
};
