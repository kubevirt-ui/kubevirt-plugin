import {
  IoK8sApiCoreV1ServiceAccount,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { RoleBindingModel, RoleModel, ServiceAccountModel } from '@kubevirt-utils/models';

const UPLOADER_SERVICE_ACCOUNT_NAME = 'kubevirt-disk-uploader';
const UPLOADER_ROLE_NAME = 'kubevirt-disk-uploader';
const UPLOADER_ROLEBINDING_NAME = 'kubevirt-disk-uploader';

export const serviceAccount: IoK8sApiCoreV1ServiceAccount = {
  apiVersion: ServiceAccountModel.apiVersion,
  kind: ServiceAccountModel.kind,
  metadata: {
    name: UPLOADER_SERVICE_ACCOUNT_NAME,
  },
};

export const roleBinding: IoK8sApiRbacV1RoleBinding = {
  apiVersion: `${RoleBindingModel.apiGroup}/${RoleBindingModel.apiVersion}`,
  kind: RoleBindingModel.kind,
  metadata: {
    name: UPLOADER_ROLEBINDING_NAME,
  },
  roleRef: {
    apiGroup: RoleModel.apiGroup,
    kind: RoleModel.kind,
    name: UPLOADER_ROLE_NAME,
  },
  subjects: [
    {
      kind: ServiceAccountModel.kind,
      name: UPLOADER_SERVICE_ACCOUNT_NAME,
    },
  ],
};

export const role: IoK8sApiRbacV1Role = {
  apiVersion: `${RoleModel.apiGroup}/${RoleModel.apiVersion}`,
  kind: RoleModel.kind,
  metadata: {
    name: UPLOADER_ROLE_NAME,
  },
  rules: [
    {
      apiGroups: ['export.kubevirt.io'],
      resources: ['virtualmachineexports'],
      verbs: ['get', 'create'],
    },
    {
      apiGroups: [''],
      resources: ['secrets'],
      verbs: ['get', 'create'],
    },
    {
      apiGroups: [''],
      resources: ['pods'],
      verbs: ['get'],
    },
  ],
};

export const ALREADY_CREATED_ERROR_CODE = 409;

export const UPSTREAM_UPLOADER_IMAGE = 'quay.io/kubevirt/tekton-tasks:v0.23.0';
export const DOWNSTREAM_UPLOADER_IMAGE =
  'registry-proxy.engineering.redhat.com/rh-osbs/container-native-virtualization-kubevirt-tekton-tasks-create-datavolume-rhel9:v4.99.0-50';
