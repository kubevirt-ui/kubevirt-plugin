import { Location } from 'react-router-dom-v5-compat';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1Container,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { sortByDirection, universalComparator } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { SortByDirection } from '@patternfly/react-table';

export const KUBEVIRT_VM_LATENCY_LABEL = 'kiagnose/checkup-type';
export const STATUS_TIMEOUT = 'spec.timeout';
export const STATUS_START_TIME_STAMP = 'status.startTimestamp';
export const STATUS_FAILURE_REASON = 'status.failureReason';
export const STATUS_SUCCEEDED = 'status.succeeded';
export const STATUS_COMPLETION_TIME_STAMP = 'status.completionTimestamp';
export const CONFIGMAP_NAME = 'CONFIGMAP_NAME';
export const CONFIGMAP_NAMESPACE = 'CONFIGMAP_NAMESPACE';

export const generateWithNumbers = (name: string): string =>
  `${name}-${Math.floor(Math.random() * 10000)}`;

export const findObjectByName = <T extends K8sResourceCommon>(
  arr: T[],
  name: string,
): T | undefined => (arr || []).find((obj) => obj?.metadata?.name === name);

export const columnsSorting = (
  data: IoK8sApiCoreV1ConfigMap[],
  sortDirection: SortByDirection,
  field: string,
  alternativeField = '',
) =>
  data.toSorted((a, b) => {
    const aParam = a?.data?.[field] || a?.data?.[alternativeField];
    const bParam = b?.data?.[field] || b?.data?.[alternativeField];

    return sortByDirection(universalComparator, sortDirection)(aParam, bParam);
  });

export const trimLastHistoryPath = (pathName: Location['pathname']): string => {
  return pathName.endsWith('checkups') ? pathName : pathName.replace(/\/[^\/]*$/, '');
};

export const getJobContainers = (job: IoK8sApiBatchV1Job): IoK8sApiCoreV1Container[] =>
  job?.spec?.template?.spec?.containers;

export const getJobByName = (
  jobs: IoK8sApiBatchV1Job[],
  configMapName: string,
  exactMatch = true,
): IoK8sApiBatchV1Job[] =>
  (jobs || [])
    ?.filter((job) => {
      const envs = getJobContainers(job)
        ?.map((containers) => containers?.env)
        .flat();
      const name = envs?.find((env) => env?.name === CONFIGMAP_NAME)?.value;
      if (exactMatch) {
        return name === configMapName && job;
      } else {
        return name?.includes(configMapName) && job;
      }
    })
    .sort((a, b) =>
      new Date(a.metadata.creationTimestamp) < new Date(b.metadata.creationTimestamp) ? 1 : -1,
    );

export enum CheckupsStatus {
  'Deleting' = 'deleting',
  'Done' = 'done',
  'Failed' = 'failed',
  'Pending' = 'pending',
  'Running' = 'running',
}

export const getJobStatus = (job?: IoK8sApiBatchV1Job): CheckupsStatus => {
  if (!job) return CheckupsStatus.Pending;

  const { status } = job;
  if (!status) return CheckupsStatus.Pending;

  if (status.succeeded && status.succeeded > 0) return CheckupsStatus.Done;
  if (status.failed && status.failed > 0) return CheckupsStatus.Failed;
  if (status.active && status.active > 0) return CheckupsStatus.Running;
  if (status.terminating && status.terminating > 0) return CheckupsStatus.Deleting;

  return CheckupsStatus.Pending;
};

export const getConfigMapStatus = (
  configMap: IoK8sApiCoreV1ConfigMap,
  jobStatus: CheckupsStatus,
): CheckupsStatus => {
  if (configMap?.data?.[STATUS_SUCCEEDED] === 'true') return CheckupsStatus.Done;

  if (configMap?.data?.[STATUS_SUCCEEDED] === 'false' || jobStatus === CheckupsStatus.Failed)
    return CheckupsStatus.Failed;

  if (configMap?.data?.[STATUS_SUCCEEDED] === undefined && jobStatus === CheckupsStatus.Done)
    return CheckupsStatus.Failed;

  if (configMap?.data?.[STATUS_SUCCEEDED] === undefined && jobStatus === CheckupsStatus.Running)
    return CheckupsStatus.Running;

  // Default to Running if no other conditions match
  return CheckupsStatus.Running;
};

export const getCheckupImageFromNewestJob = (jobs: IoK8sApiBatchV1Job[]): string => {
  const [newestJob] =
    jobs
      ?.filter((it) => it?.metadata?.creationTimestamp)
      .sort((a, b) => b.metadata.creationTimestamp.localeCompare(a.metadata.creationTimestamp)) ??
    [];
  return getJobContainers(newestJob)?.[0]?.image;
};

export const extractConfigMapName = (
  job: IoK8sApiBatchV1Job,
): { name: string; namespace: string } | null => {
  const containers = getJobContainers(job);
  const envs = containers?.[0]?.env;
  const configMapEnv = envs?.find((env) => env?.name === CONFIGMAP_NAME);
  const configMapName = configMapEnv?.value;

  if (!configMapName || !job.metadata?.namespace) {
    return null;
  }

  const baseName = configMapName.replace(/-\d+-results$/, '');

  return {
    name: baseName,
    namespace: job.metadata.namespace,
  };
};
