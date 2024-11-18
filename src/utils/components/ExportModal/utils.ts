import { IoK8sApiCoreV1Pod, IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  PodModel,
  RoleBindingModel,
  RoleModel,
  SecretModel,
  ServiceAccountModel,
} from '@kubevirt-utils/models';
import { encodeSecretKey } from '@kubevirt-utils/resources/secret/utils';
import { getRandomChars, isUpstream } from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import {
  DOWNSTREAM_UPLOADER_IMAGE,
  role,
  roleBinding,
  serviceAccount,
  UPSTREAM_UPLOADER_IMAGE,
} from './constants';

type CreateSecretType = (input: {
  namespace: string;
  password: string;
  secretName: string;
  username: string;
}) => Promise<IoK8sApiCoreV1Secret>;

export const createSecret: CreateSecretType = ({ namespace, password, secretName, username }) =>
  k8sCreate({
    data: {
      apiVersion: 'v1',
      data: {
        accessKeyId: encodeSecretKey(username),
        secretKey: encodeSecretKey(password),
      },
      kind: 'Secret',
      metadata: {
        name: secretName,
        namespace,
      },
      type: 'Opaque',
    },
    model: SecretModel,
    ns: namespace,
  });

export const createServiceAccount = async (namespace: string) => {
  await Promise.all([
    k8sCreate({ data: serviceAccount, model: ServiceAccountModel, ns: namespace }),
    k8sCreate({ data: role, model: RoleModel, ns: namespace }),
  ]);

  return k8sCreate({ data: roleBinding, model: RoleBindingModel, ns: namespace });
};

type CreateUploaderPodType = (input: {
  destination: string;
  namespace: string;
  secretName: string;
  vmName: string;
  volumeName: string;
}) => Promise<IoK8sApiCoreV1Pod>;

export const createUploaderPod: CreateUploaderPodType = ({
  destination,
  namespace,
  secretName,
  vmName,
  volumeName,
}) =>
  k8sCreate({
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
