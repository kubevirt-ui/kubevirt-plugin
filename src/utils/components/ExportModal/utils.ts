import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { PodModel, RoleBindingModel, RoleModel, ServiceAccountModel } from '@kubevirt-utils/models';
import { getRandomChars, isEmpty, isUpstream } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import {
  DOWNSTREAM_UPLOADER_IMAGE,
  role,
  roleBinding,
  serviceAccount,
  UPLOAD_STATUSES,
  UPSTREAM_UPLOADER_IMAGE,
} from './constants';

export const createServiceAccount = async (cluster: string, namespace: string) => {
  await Promise.all([
    kubevirtK8sCreate({ cluster, data: serviceAccount, model: ServiceAccountModel, ns: namespace }),
    kubevirtK8sCreate({ cluster, data: role, model: RoleModel, ns: namespace }),
  ]);

  return kubevirtK8sCreate({ cluster, data: roleBinding, model: RoleBindingModel, ns: namespace });
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
            volumeMounts: [
              {
                mountPath: '/tmp',
                name: 'disk',
              },
            ],
          },
        ],
        restartPolicy: 'Never',
        serviceAccountName: 'kubevirt-disk-uploader',
        volumes: [
          {
            emptyDir: {},
            name: 'disk',
          },
        ],
      },
    } as IoK8sApiCoreV1Pod,
    model: PodModel,
  });

export const exportFailed = (pod: IoK8sApiCoreV1Pod) =>
  [UPLOAD_STATUSES.FAILED, UPLOAD_STATUSES.UNKNOWN].includes(pod?.status?.phase as UPLOAD_STATUSES);

export const exportSucceeded = (pod: IoK8sApiCoreV1Pod) =>
  [UPLOAD_STATUSES.SUCCEEDED].includes(pod?.status?.phase as UPLOAD_STATUSES);

export const exportInProgress = (pod: IoK8sApiCoreV1Pod) =>
  !isEmpty(pod) && !exportFailed(pod) && !exportSucceeded(pod);
