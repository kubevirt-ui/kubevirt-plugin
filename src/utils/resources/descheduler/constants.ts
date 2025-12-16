import { ClusterServiceVersionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { KubeDeschedulerModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { modelToRef } from '@kubevirt-utils/models';

export const KUBE_DESCHEDULER_NAMESPACE = 'openshift-kube-descheduler-operator';
export const KUBE_DESCHEDULER_NAME = 'cluster';

export const KUBE_DESCHEDULER_URL = `/k8s/ns/${KUBE_DESCHEDULER_NAMESPACE}/${modelToRef(
  KubeDeschedulerModel,
)}/${KUBE_DESCHEDULER_NAME}`;

export const DESCHEDULER_OPERATORS_URL = `/k8s/ns/${KUBE_DESCHEDULER_NAMESPACE}/${modelToRef(
  ClusterServiceVersionModel,
)}`;
