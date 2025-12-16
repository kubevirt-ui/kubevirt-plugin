import { Location } from 'react-router-dom-v5-compat';

import { JobModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1Container,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { sortByDirection, universalComparator } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  K8sResourceCommon,
  Operator,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { SortByDirection } from '@patternfly/react-table';
import { Fleet } from '@stolostron/multicluster-sdk';

import { CHECKUP_URLS } from './constants';

export const KUBEVIRT_VM_LATENCY_LABEL = 'kiagnose/checkup-type';
export const STATUS_TIMEOUT = 'spec.timeout';
export const STATUS_START_TIME_STAMP = 'status.startTimestamp';
export const STATUS_FAILURE_REASON = 'status.failureReason';
export const STATUS_SUCCEEDED = 'status.succeeded';
export const STATUS_COMPLETION_TIME_STAMP = 'status.completionTimestamp';
export const CONFIGMAP_NAME = 'CONFIGMAP_NAME';
export const CONFIGMAP_NAMESPACE = 'CONFIGMAP_NAMESPACE';
export const CREATE_RESULTS_RESOURCES = 'CREATE_RESULTS_RESOURCES';

/**
 * Creates a watch configuration for Kubernetes Jobs used in checkups.
 * @param labelValue - The value for the KUBEVIRT_VM_LATENCY_LABEL match label
 * @param namespace - Optional namespace. If provided and not ALL_NAMESPACES_SESSION_KEY, filters to that namespace
 * @param matchExpressions - Optional array of match expressions to add to the selector
 * @returns A watch configuration object for useK8sWatchResource
 */
export const createJobWatchConfig = (
  labelValue: string,
  namespace?: string,
  cluster?: string,
  matchExpressions?: Array<{ key: string; operator: Operator }>,
): Fleet<WatchK8sResource> => ({
  cluster,
  groupVersionKind: modelToGroupVersionKind(JobModel),
  isList: true,
  ...(namespace && namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace, namespaced: true }),
  selector: {
    ...(matchExpressions && { matchExpressions }),
    matchLabels: {
      [KUBEVIRT_VM_LATENCY_LABEL]: labelValue,
    },
  },
});

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
    .filter((job) => {
      const configMapInfo = extractConfigMapName(job);
      if (!configMapInfo) {
        return false;
      }

      if (exactMatch) {
        // For exact match, compare with the full CONFIGMAP_NAME value (including -<number>-results suffix)
        return configMapInfo.fullName === configMapName;
      } else {
        // For non-exact match, compare with the base name (without -<number>-results suffix)
        return configMapInfo.name === configMapName;
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
  configMap: IoK8sApiCoreV1ConfigMap | undefined,
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

/**
 * Extracts the base name from a results ConfigMap name.
 * ConfigMap names follow the pattern: `<baseName>-<number>-results` (e.g., "my-checkup-1234-results").
 * This function removes the `-<number>-results` suffix to get the base name.
 * If the pattern doesn't match, it falls back to removing just the `-results` suffix.
 *
 * @param configMapName - The full ConfigMap name (e.g., "my-checkup-1234-results")
 * @returns The base name without the suffix (e.g., "my-checkup")
 */
export const extractConfigMapBaseName = (configMapName: string): string => {
  const baseNameRegex = /^(.+)-\d+-results$/;
  const baseNameMatch = baseNameRegex.exec(configMapName);
  return baseNameMatch ? baseNameMatch[1] : configMapName.replace(/-results$/, '');
};

/**
 * Extracts the ConfigMap name and namespace from a Job's environment variables.
 *
 * The Job's CONFIGMAP_NAME env var contains the results ConfigMap name, which follows
 * the pattern: `<baseName>-<number>-results` (e.g., "my-checkup-1234-results").
 * The `-results` suffix is added when creating the self validation job (see `selfValidationJob`
 * function), where the job name (with random number) is combined with "-results" to form
 * the results ConfigMap name.
 * This function extracts both the full name and the base name (without `-<number>-results` suffix).
 *
 * @param job - The Kubernetes Job to extract ConfigMap info from
 * @returns An object with the full name, base name, and namespace, or null if not found
 */
export const extractConfigMapName = (
  job: IoK8sApiBatchV1Job,
): { cluster: string; fullName: string; name: string; namespace: string } | null => {
  const containers = getJobContainers(job);
  const envs = containers?.[0]?.env;
  const configMapEnv = envs?.find((env) => env?.name === CONFIGMAP_NAME);
  const configMapName = configMapEnv?.value;

  if (!configMapName || !job.metadata?.namespace) {
    return null;
  }

  const baseName = extractConfigMapBaseName(configMapName);

  return {
    cluster: getCluster(job),
    fullName: configMapName,
    name: baseName,
    namespace: job.metadata.namespace,
  };
};

/**
 * Determines the current checkup type from the URL pathname
 * @param pathname - The current location pathname
 * @returns The checkup type ('network' | 'storage' | 'self-validation') or null if not found
 */
export const getCurrentCheckupType = (
  pathname: string,
): 'network' | 'self-validation' | 'storage' | null => {
  if (pathname.includes(`/${CHECKUP_URLS.NETWORK}`)) {
    return CHECKUP_URLS.NETWORK as 'network';
  }
  if (pathname.includes(`/${CHECKUP_URLS.STORAGE}`)) {
    return CHECKUP_URLS.STORAGE as 'storage';
  }
  if (pathname.includes(`/${CHECKUP_URLS.SELF_VALIDATION}`)) {
    return CHECKUP_URLS.SELF_VALIDATION as 'self-validation';
  }
  return null;
};
