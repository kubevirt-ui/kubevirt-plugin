import { Buffer } from 'buffer';

import { SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { PodModel } from '@kubevirt-utils/models';
import { getName, getNamespace, getStatusPhase } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { UploadStatuses } from './constants';
import { parseLogEntry, reduceProgress } from './hooks/parseUploaderLog';
import { type UploaderProgress } from './hooks/types';

export const exportFailed = (pod: IoK8sApiCoreV1Pod): boolean =>
  [UploadStatuses.Failed, UploadStatuses.Unknown].includes(getStatusPhase<UploadStatuses>(pod));

export const exportSucceeded = (pod: IoK8sApiCoreV1Pod): boolean =>
  [UploadStatuses.Succeeded].includes(getStatusPhase<UploadStatuses>(pod));

export const isExportFormIncomplete = (fields: string[]): boolean =>
  fields.some((field) => !field?.trim());

export const shouldConnectToUploader = (pod: IoK8sApiCoreV1Pod | undefined): boolean => {
  const isRunning = getStatusPhase(pod) === UploadStatuses.Running;
  return !isEmpty(pod) && isRunning && !exportSucceeded(pod) && !exportFailed(pod);
};

export const buildPodLogWsUrl = (basePath: string, namespace: string, podName: string): string => {
  const logPath = `${basePath}/api/v1/namespaces/${namespace}/pods/${podName}/log`;
  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${wsProtocol}://${window.location.host}${logPath}`;
};

export const processUploaderMessage = (
  base64Data: string,
  current: UploaderProgress,
): UploaderProgress => {
  const text = Buffer.from(base64Data, 'base64').toString();
  const lines = text.split('\n');

  let updated = current;
  for (const line of lines) {
    const entry = parseLogEntry(line);
    if (entry) {
      updated = reduceProgress(updated, entry);
    }
  }

  return updated;
};

export const getExportErrorMessage = (
  pod: IoK8sApiCoreV1Pod,
  uploaderErrorMessage?: string,
): string =>
  uploaderErrorMessage ??
  pod?.status?.containerStatuses?.[0]?.state?.terminated?.message ??
  pod?.status?.message;

export const deleteExportResources = (
  pod: IoK8sApiCoreV1Pod,
  secretName: string,
): Promise<unknown[]> => {
  const podCluster = getCluster(pod);
  const podNamespace = getNamespace(pod);

  return Promise.allSettled([
    kubevirtK8sDelete({
      cluster: podCluster,
      model: PodModel,
      resource: { metadata: { name: getName(pod), namespace: podNamespace } },
    }),
    kubevirtK8sDelete({
      cluster: podCluster,
      model: SecretModel,
      resource: { metadata: { name: secretName, namespace: podNamespace } },
    }),
  ]);
};
