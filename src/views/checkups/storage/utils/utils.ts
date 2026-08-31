import { type TFunction } from 'i18next';

import { ConfigMapModel, JobModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { type SimpleSelectOption } from '@patternfly/react-templates';

import {
  storageCheckupConfigMap,
  storageCheckupJob,
  type StorageCheckupParams,
} from './storageResources';

export {
  deleteStorageCheckup,
  deleteStorageJob,
  rerunStorageCheckup,
} from './storageCheckupOperations';
export { installOrRemoveCheckupsStoragePermissions } from './storagePermissions';
export type { SkipTeardownOption, StorageCheckupParams } from './storageResources';

export const getSkipTeardownLabel = (
  t: TFunction,
  value: 'always' | 'never' | 'onfailure',
): string => {
  const labels: Record<string, string> = {
    always: t('Always'),
    never: t('Never'),
    onfailure: t('On failure'),
  };
  return labels[value] ?? value;
};

const SKIP_TEARDOWN_VALUES: Array<'always' | 'never' | 'onfailure'> = [
  'never',
  'onfailure',
  'always',
];

export const getSkipTeardownOptions = (t: TFunction): SimpleSelectOption[] =>
  SKIP_TEARDOWN_VALUES.map((value) => ({ content: getSkipTeardownLabel(t, value), value }));

export const NUM_OF_VMS_MIN = 1;
export const NUM_OF_VMS_MAX = 100;

export const isNumOfVMsInvalid = (value: string): boolean => {
  if (!value) {
    return false;
  }
  const num = Number(value);
  return !Number.isInteger(num) || num < NUM_OF_VMS_MIN || num > NUM_OF_VMS_MAX;
};

export const parseMinutesValue = (raw: string): number => Number(raw.trim().replace(/m$/i, ''));

export const createStorageCheckup = async (
  params: StorageCheckupParams & { checkupImage: string; cluster: string },
): Promise<IoK8sApiBatchV1Job> => {
  const { checkupImage, cluster, name, namespace } = params;

  await kubevirtK8sCreate({
    cluster,
    data: storageCheckupConfigMap(params),
    model: ConfigMapModel,
  });

  return kubevirtK8sCreate({
    cluster,
    data: storageCheckupJob(name, namespace, checkupImage),
    model: JobModel,
  });
};
