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
export const STATUS_COMPILATION_TIME_STAMP = 'status.completionTimestamp';
export const CONFIGMAP_NAME = 'CONFIGMAP_NAME';

export const generateWithNumbers = (name: string): string =>
  `${name}-${Math.floor(Math.random() * 10000)}`;

export const findObjectByName = <T extends K8sResourceCommon>(arr: T[], name: string): T =>
  (arr || []).find((obj) => obj?.metadata?.name === name);

export const columnsSorting = (
  data: IoK8sApiCoreV1ConfigMap[],
  sortDirection: SortByDirection,
  field: string,
  alternativeField = '',
) =>
  data.sort((a, b) => {
    const aParam = a?.data?.[field] || a?.data?.[alternativeField];
    const bParam = b?.data?.[field] || b?.data?.[alternativeField];

    return sortByDirection(universalComparator, sortDirection)(aParam, bParam);
  });

export const trimLastHistoryPath = (pathName: Location['pathname']): string => {
  return pathName.endsWith('checkups') ? pathName : pathName.replace(/\/[^\/]*$/, '');
};

const getJobContainers = (job: IoK8sApiBatchV1Job): IoK8sApiCoreV1Container[] =>
  job?.spec?.template?.spec?.containers;

export const getJobByName = (
  jobs: IoK8sApiBatchV1Job[],
  configMapName: string,
): IoK8sApiBatchV1Job[] =>
  (jobs || [])
    ?.filter((job) => {
      const envs = getJobContainers(job)
        ?.map((containers) => containers?.env)
        .flat();
      const name = envs?.find((env) => env?.name == CONFIGMAP_NAME)?.value;
      return name === configMapName && job;
    })
    .sort((a, b) =>
      new Date(a.metadata.creationTimestamp) < new Date(b.metadata.creationTimestamp) ? 1 : -1,
    );

export enum NetworkCheckupsStatus {
  'Done' = 'done',
  'Failed' = 'failed',
  'Running' = 'running',
}

export const getJobStatus = (job: IoK8sApiBatchV1Job): NetworkCheckupsStatus => {
  if (job?.status?.succeeded === 1) return NetworkCheckupsStatus.Done;

  if (job?.status?.active === 1) return NetworkCheckupsStatus.Running;

  if (job?.status?.succeeded === 0 || job?.status?.failed === 1)
    return NetworkCheckupsStatus.Failed;
};

export const getConfigMapStatus = (
  configMap: IoK8sApiCoreV1ConfigMap,
  jobStatus: NetworkCheckupsStatus,
): NetworkCheckupsStatus => {
  if (configMap?.data?.[STATUS_SUCCEEDED] === 'true') return NetworkCheckupsStatus.Done;

  if (configMap?.data?.[STATUS_SUCCEEDED] === 'false' || jobStatus === NetworkCheckupsStatus.Failed)
    return NetworkCheckupsStatus.Failed;

  if (configMap?.data?.[STATUS_SUCCEEDED] === undefined && jobStatus === NetworkCheckupsStatus.Done)
    return NetworkCheckupsStatus.Failed;

  if (
    configMap?.data?.[STATUS_SUCCEEDED] === undefined &&
    jobStatus === NetworkCheckupsStatus.Running
  )
    return NetworkCheckupsStatus.Running;
};

export const getCheckupImageFromNewestJob = (jobs: IoK8sApiBatchV1Job[]): string => {
  const [newestJob] =
    jobs
      ?.filter((it) => it?.metadata?.creationTimestamp)
      .sort((a, b) => b.metadata.creationTimestamp.localeCompare(a.metadata.creationTimestamp)) ??
    [];
  return newestJob?.spec?.template?.spec?.containers?.[0]?.image;
};
