import {
  getBootableVolumePVCSource,
  getDataVolumeForPVC,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import {
  getDiskSize,
  getPVCStorageClassName,
  getVolumeSnapshotStorageClass,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getAnnotation, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getOSFromDefaultPreference } from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/utils';

import { BootableVolumeResolvedSources, BootableVolumeSortContext } from '../../../types';

const getBootableVolumeResolvedSources = (
  bootableVolume: BootableVolume,
  {
    dvSources,
    pvcSources,
    volumeSnapshotSources,
  }: Pick<BootableVolumeSortContext, 'dvSources' | 'pvcSources' | 'volumeSnapshotSources'>,
): BootableVolumeResolvedSources => {
  const pvcSource = getBootableVolumePVCSource(bootableVolume, pvcSources);
  const dvSource = getDataVolumeForPVC(pvcSource, dvSources);

  return {
    dvSource,
    pvcSource,
    volumeSnapshotSource: volumeSnapshotSources?.[getName(bootableVolume)],
  };
};

export const getBootableVolumeSortDiskSize = (
  bootableVolume: BootableVolume,
  context: Pick<BootableVolumeSortContext, 'dvSources' | 'pvcSources' | 'volumeSnapshotSources'>,
): string => {
  const { dvSource, pvcSource, volumeSnapshotSource } = getBootableVolumeResolvedSources(
    bootableVolume,
    context,
  );

  return getDiskSize(dvSource, pvcSource, volumeSnapshotSource);
};

export const getBootableVolumeSortStorageClass = (
  bootableVolume: BootableVolume,
  context: Pick<BootableVolumeSortContext, 'dvSources' | 'pvcSources' | 'volumeSnapshotSources'>,
): string => {
  const { pvcSource, volumeSnapshotSource } = getBootableVolumeResolvedSources(
    bootableVolume,
    context,
  );

  return getPVCStorageClassName(pvcSource) || getVolumeSnapshotStorageClass(volumeSnapshotSource);
};

export type BootableVolumeSortValueGetter = (bootableVolume: BootableVolume) => string;

export const getBootableVolumeSortCriteria = (
  context: BootableVolumeSortContext,
): { columnIndex: number; columnToSortBy: BootableVolumeSortValueGetter }[] => [
  { columnIndex: 0, columnToSortBy: (bootableVolume) => getName(bootableVolume) },
  { columnIndex: 1, columnToSortBy: (bootableVolume) => getArchitecture(bootableVolume) },
  ...(context.includeNamespaceColumn
    ? [
        {
          columnIndex: 2,
          columnToSortBy: (bootableVolume: BootableVolume) => getNamespace(bootableVolume),
        },
      ]
    : []),
  {
    columnIndex: 3,
    columnToSortBy: (bootableVolume) =>
      getOSFromDefaultPreference(
        bootableVolume,
        context.clusterPreferencesMap,
        context.userPreferencesMap,
      ),
  },
  {
    columnIndex: 4,
    columnToSortBy: (bootableVolume) => getBootableVolumeSortStorageClass(bootableVolume, context),
  },
  {
    columnIndex: 5,
    columnToSortBy: (bootableVolume) => getBootableVolumeSortDiskSize(bootableVolume, context),
  },
  {
    columnIndex: 6,
    columnToSortBy: (bootableVolume) => getAnnotation(bootableVolume, ANNOTATIONS.description),
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
  volumes: BootableVolume[],
  sortCriteria: BootableVolumeSortCriterion,
  columnToSortBy: BootableVolumeSortValueGetter,
): BootableVolume[] =>
  [...volumes].sort((firstVolume, secondVolume) => {
    const firstColumnValue = columnToSortBy(firstVolume);
    const secondColumnValue = columnToSortBy(secondVolume);

    return sortFunctionByDirection[sortCriteria.direction](firstColumnValue, secondColumnValue);
  });

export const sortBootableVolumesWithColumnGetters = (
  volumes: BootableVolume[],
  sortCriteria: BootableVolumeSortCriterion,
  context: BootableVolumeSortContext,
): BootableVolume[] => {
  if (isEmpty(sortCriteria)) {
    return [...volumes];
  }

  const bootableVolumeSortCriteria = getBootableVolumeSortCriteria(context).find(
    (criteria) => criteria.columnIndex === sortCriteria.columnIndex,
  );

  if (!bootableVolumeSortCriteria) {
    return [...volumes];
  }

  return sortBootableVolumesByCriterion(
    volumes,
    sortCriteria,
    bootableVolumeSortCriteria.columnToSortBy,
  );
};
