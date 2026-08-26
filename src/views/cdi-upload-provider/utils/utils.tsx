import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1beta1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import { ProgressVariant } from '@patternfly/react-core';

import { UPLOAD_STATUS } from './consts';
import type { OperatingSystemRecord } from './types';

export { injectDisabled, resourcePath, resourcePathFromModel, updateDV } from './dataVolumeUtils';

export const killCDIBoundPVC = (pvc: V1beta1PersistentVolumeClaim): Promise<unknown> =>
  k8sDelete({
    model: DataVolumeModel,
    resource: pvc,
  });

export const getProgressVariant = (status: UPLOAD_STATUS): null | ProgressVariant => {
  switch (status) {
    case UPLOAD_STATUS.ERROR:
      return ProgressVariant.danger;
    case UPLOAD_STATUS.SUCCESS:
      return ProgressVariant.success;
    default:
      return null;
  }
};

export const joinGrammaticallyListOfItems = (items: string[], separator = 'and'): string => {
  const result = items.join(', ');
  const lastCommaIdx = result.lastIndexOf(',');

  return items.length > 1 && lastCommaIdx >= 0
    ? `${result.substring(0, lastCommaIdx)} ${separator}${result.substring(lastCommaIdx + 1)}`
    : result;
};

export const stringValueUnitSplit = (combinedVal: string): [string, string | undefined] => {
  const index = combinedVal.search(/([a-zA-Z]+)/g);
  let value: string;
  let unit: string | undefined;
  if (index === -1) {
    value = combinedVal;
  } else {
    value = combinedVal.slice(0, index);
    unit = combinedVal.slice(index);
  }
  return [value, unit];
};

const splitVersion = (osID: string): number[] =>
  (osID ?? '')
    .split(/\D/)
    .filter((part) => part)
    .map((num) => parseInt(num));

export const compareVersions = (version1: string, version2: string): number => {
  if (!version1 && !version2) {
    return 0;
  }
  // 'devel' version if exist is always the highest version.
  if (version1 === 'devel') {
    return 1;
  }
  if (version2 === 'devel') {
    return -1;
  }

  const finalVersion1 = splitVersion(version1) ?? [];
  const finalVersion2 = splitVersion(version2) ?? [];

  const selectedArray =
    finalVersion1?.length > finalVersion2?.length ? finalVersion1 : finalVersion2;
  const zipped = selectedArray.map((_unused, index) => {
    return [finalVersion1?.[index], finalVersion2?.[index]];
  });
  let idx = 0;
  while (idx < zipped.length) {
    const ver1 = zipped[idx][0] ?? 0;
    const ver2 = zipped[idx][1] ?? 0;

    if (ver1 > ver2) return 1;
    if (ver2 > ver1) return -1;

    idx++;
  }

  return 0;
};

const descSortOSes = (os1: OperatingSystemRecord, os2: OperatingSystemRecord): number => {
  const nameCMP = (os1.name ?? '').localeCompare(os2.name ?? '');
  if (nameCMP !== 0) {
    return nameCMP * -1;
  }

  return compareVersions(os1.id, os2.id) * -1;
};

export const removeOSDups = (osArr: OperatingSystemRecord[]): OperatingSystemRecord[] => {
  const osNames = new Set<string>();
  return osArr
    .reduce<OperatingSystemRecord[]>((acc, osItem) => {
      if (osItem?.name && !osNames.has(osItem?.name)) {
        osNames.add(osItem?.name);
        acc.push(osItem);
      }
      return acc;
    }, [])
    .sort(descSortOSes);
};
