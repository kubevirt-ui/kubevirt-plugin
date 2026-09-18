import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { K8sGroupVersionKind, K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import type { UploadLinkedResource } from '../types';

export const getUploadLinkedResource = (
  model: K8sModel,
  name: string,
  namespace?: string,
  cluster?: string,
): UploadLinkedResource => {
  const resource: UploadLinkedResource = {
    groupVersionKind: modelToGroupVersionKind(model),
    name,
  };

  if (cluster) {
    resource.cluster = cluster;
  }

  if (namespace) {
    resource.namespace = namespace;
  }

  return resource;
};

export const isSameGroupVersionKind = (
  left: K8sGroupVersionKind,
  right: K8sGroupVersionKind,
): boolean =>
  (left.group ?? '') === (right.group ?? '') &&
  left.version === right.version &&
  left.kind === right.kind;
