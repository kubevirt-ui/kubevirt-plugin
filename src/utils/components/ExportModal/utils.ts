// eslint-disable-next-line
import { Buffer } from 'buffer';

import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { PodModel, RoleBindingModel, RoleModel, ServiceAccountModel } from '@kubevirt-utils/models';
import { getStatusPhase } from '@kubevirt-utils/resources/shared';
import {
  createIfNotExists,
  getRandomChars,
  isEmpty,
  isUpstream,
} from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sUpdate } from '@multicluster/k8sRequests';

import {
  ALREADY_CREATED_ERROR_CODE,
  DOWNSTREAM_UPLOADER_IMAGE,
  role,
  roleBinding,
  serviceAccount,
  UploadStatuses,
  UPSTREAM_UPLOADER_IMAGE,
} from './constants';
import { parseLogEntry, reduceProgress } from './hooks/parseUploaderLog';
import { type UploaderProgress } from './hooks/types';

import { SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

const createOrUpdateRole = async (cluster: string, namespace: string): Promise<void> => {
  try {
    await kubevirtK8sCreate({ cluster, data: role, model: RoleModel, ns: namespace });
  } catch (error) {
    if (error.code !== ALREADY_CREATED_ERROR_CODE) throw error;
    await kubevirtK8sUpdate({ cluster, data: role, model: RoleModel, ns: namespace });
  }
};

export const createServiceAccount = async (cluster: string, namespace: string): Promise<void> => {
  await Promise.all([
    createIfNotExists(
      kubevirtK8sCreate({
        cluster,
        data: serviceAccount,
        model: ServiceAccountModel,
        ns: namespace,
      }),
    ),
    createOrUpdateRole(cluster, namespace),
    createIfNotExists(
      kubevirtK8sCreate({
        cluster,
        data: roleBinding,
        model: RoleBindingModel,
        ns: namespace,
      }),
    ),
  ]);
};

type CreateUploaderPodType = (input: {
  cluster: string;
  destination: string;
  namespace: string;
  secretName: string;
  vmName: string;
  volumeName: string;
}) => Promise<IoK8sApiCoreV1Pod>;

export const createUploaderPod: CreateUploaderPodType = ({
  cluster,
  destination,
  namespace,
  secretName,
  vmName,
  volumeName,
}) =>
  kubevirtK8sCreate({
    cluster,
    data: {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: {
        labels: {
          'app.kubernetes.io/component': 'disk-uploader',
          'app.kubernetes.io/managed-by': 'kubevirt-plugin',
        },
        name: `kubevirt-disk-uploader-${getRandomChars()}`,
        namespace,
      },
      spec: {
        containers: [
          {
            args: [
              '--export-source-name',
              vmName ?? volumeName,
              '--volumename',
              volumeName,
              '--imagedestination',
              destination,
              '--export-source-kind',
              vmName ? 'vm' : 'pvc',
            ],

            command: ['/usr/local/bin/disk-uploader'],
            env: [
              {
                name: 'ACCESS_KEY_ID',
                valueFrom: {
                  secretKeyRef: {
                    key: 'accessKeyId',
                    name: secretName,
                  },
                },
              },
              {
                name: 'SECRET_KEY',
                valueFrom: {
                  secretKeyRef: {
                    key: 'secretKey',
                    name: secretName,
                  },
                },
              },
              {
                name: 'POD_NAMESPACE',
                valueFrom: {
                  fieldRef: {
                    fieldPath: 'metadata.namespace',
                  },
                },
              },
              {
                name: 'POD_NAME',
                valueFrom: {
                  fieldRef: {
                    fieldPath: 'metadata.name',
                  },
                },
              },
            ],
            image: isUpstream ? UPSTREAM_UPLOADER_IMAGE : DOWNSTREAM_UPLOADER_IMAGE,
            imagePullPolicy: 'Always',
            name: 'kubevirt-disk-uploader',
            resources: {
              limits: {
                memory: '5Gi',
              },
              requests: {
                memory: '3Gi',
              },
            },
            securityContext: {
              allowPrivilegeEscalation: false,
              capabilities: { drop: ['ALL'] },
            },
            volumeMounts: [
              {
                mountPath: '/tmp',
                name: 'disk',
              },
            ],
          },
        ],
        restartPolicy: 'Never',
        securityContext: {
          runAsNonRoot: true,
          seccompProfile: {
            type: 'RuntimeDefault',
          },
        },
        serviceAccountName: 'kubevirt-disk-uploader',
        volumes: [
          {
            emptyDir: { sizeLimit: '10Gi' },
            name: 'disk',
          },
        ],
      },
    } as IoK8sApiCoreV1Pod,
    model: PodModel,
  });

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
