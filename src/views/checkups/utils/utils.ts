import { type TFunction } from 'i18next';

import { JobModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type IoK8sApiBatchV1Job,
  type IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { sortByDirection, universalComparator } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  type K8sResourceCommon,
  type Operator,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { type SortByDirection } from '@patternfly/react-table';
import { type Fleet } from '@stolostron/multicluster-sdk';

import { extractConfigMapName } from './checkupHelpers';
import { CHECKUP_URLS } from './constants';
import { type CheckupType } from './types';

export {
  extractConfigMapBaseName,
  extractConfigMapName,
  getCheckupImageFromNewestJob,
  getJobContainers,
} from './checkupHelpers';
export {
  CheckupsStatus,
  getConfigMapStatus,
  getCSVExportStatusLabel,
  getIsJobCompleted,
  getJobStatus,
  getJobStatusRank,
  isJobFailedCondition,
  isJobRunning,
} from './jobStatus';

export const KUBEVIRT_VM_LATENCY_LABEL = 'kiagnose/checkup-type';
export const STATUS_TIMEOUT = 'spec.timeout';
export const STATUS_START_TIME_STAMP = 'status.startTimestamp';
export const STATUS_FAILURE_REASON = 'status.failureReason';
export const STATUS_SUCCEEDED = 'status.succeeded';
export const STATUS_COMPLETION_TIME_STAMP = 'status.completionTimestamp';
export const CONFIGMAP_NAME = 'CONFIGMAP_NAME';
export const CONFIGMAP_NAMESPACE = 'CONFIGMAP_NAMESPACE';
export const CREATE_RESULTS_RESOURCES = 'CREATE_RESULTS_RESOURCES';

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
    matchLabels: { [KUBEVIRT_VM_LATENCY_LABEL]: labelValue },
  },
});

export const generateWithNumbers = (name: string): string => {
  const randomValue = crypto.getRandomValues(new Uint16Array(1))[0] % 10000;
  return `${name}-${randomValue}`;
};

export const findObjectByName = <T extends K8sResourceCommon>(
  arr: T[],
  name: string,
): T | undefined => (arr ?? []).find((obj) => obj?.metadata?.name === name);

export const columnsSorting = (
  data: IoK8sApiCoreV1ConfigMap[],
  sortDirection: SortByDirection,
  field: string,
  alternativeField = '',
): IoK8sApiCoreV1ConfigMap[] =>
  data.toSorted((a, b) => {
    const aParam = a?.data?.[field] ?? a?.data?.[alternativeField];
    const bParam = b?.data?.[field] ?? b?.data?.[alternativeField];
    return sortByDirection(universalComparator, sortDirection)(aParam, bParam);
  });

export const getJobByName = (
  jobs: IoK8sApiBatchV1Job[],
  configMapName: string,
  exactMatch = true,
): IoK8sApiBatchV1Job[] =>
  (jobs ?? [])
    .filter((job) => {
      const configMapInfo = extractConfigMapName(job);
      if (!configMapInfo) {
        return false;
      }
      if (exactMatch) {
        return configMapInfo.fullName === configMapName;
      }
      return configMapInfo.name === configMapName;
    })
    .sort((a, b) =>
      new Date(a.metadata.creationTimestamp) < new Date(b.metadata.creationTimestamp) ? 1 : -1,
    );

export const getCurrentCheckupType = (pathname: string): CheckupType | null => {
  if (pathname.includes(`/${CHECKUP_URLS.STORAGE}`)) {
    return CHECKUP_URLS.STORAGE;
  }
  if (pathname.includes(`/${CHECKUP_URLS.SELF_VALIDATION}`)) {
    return CHECKUP_URLS.SELF_VALIDATION;
  }
  return null;
};

export const getSelectProjectText = (t: TFunction): string =>
  t('Select a specific project in order to run a checkup');

export const getCheckupsConfigMapRowId = (
  configMap: IoK8sApiCoreV1ConfigMap,
  index: number,
): string => {
  if (configMap?.metadata?.uid) {
    return configMap.metadata.uid;
  }
  const cluster = getCluster(configMap) ?? 'local';
  const namespace = getNamespace(configMap);
  const name = getName(configMap);
  if (namespace && name) {
    return `${cluster}-${namespace}-${name}`;
  }
  return `configmap-${index}`;
};
