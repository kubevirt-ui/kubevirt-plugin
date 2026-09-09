import defaultsDeep from 'lodash/defaultsDeep';

import { NamespaceModel, RoleBindingModel, RoleModel } from '@kubevirt-utils/models';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { InstallModeType, type K8sResourceKind } from '@overview/utils/types';

import {
  HTTP_CONFLICT_CODE,
  K8S_ALREADY_EXISTS_REASON,
  OPENSHIFT_CLUSTER_MONITORING_ANNOTATION_KEY,
  OPENSHIFT_OPERATORS_NAMESPACE,
} from './constants';
import { getPrometheusRole, getPrometheusRoleBinding } from './helpers';

type ConflictError = {
  code?: number;
  reason?: string;
};

export const resolveTargetNamespace = (
  suggestedNamespaceTemplateName: string | undefined,
  suggestedNamespace: string | undefined,
  selectedInstallMode: InstallModeType,
): string | undefined =>
  suggestedNamespaceTemplateName ??
  suggestedNamespace ??
  (selectedInstallMode === InstallModeType.InstallModeTypeAllNamespaces
    ? OPENSHIFT_OPERATORS_NAMESPACE
    : undefined);

export const ignoreConflictOrThrow = (err: ConflictError, message: string): void => {
  if (err?.code === HTTP_CONFLICT_CODE || err?.reason === K8S_ALREADY_EXISTS_REASON) {
    return;
  }
  kubevirtConsole.error(message, err);
  throw err;
};

const mergeNamespaceResources = (
  defaultNS: K8sResourceCommon,
  suggestedNamespaceTemplate: K8sResourceKind,
): K8sResourceCommon =>
  defaultsDeep({}, defaultNS, suggestedNamespaceTemplate) as K8sResourceCommon;

export const ensureOperatorNamespace = async ({
  cluster,
  enableMonitoring,
  namespaceExists,
  operatorRequestsMonitoring,
  suggestedNamespaceTemplate,
  targetNamespace,
}: {
  cluster?: string;
  enableMonitoring: boolean;
  namespaceExists: boolean;
  operatorRequestsMonitoring: boolean;
  suggestedNamespaceTemplate: K8sResourceKind;
  targetNamespace: string;
}): Promise<void> => {
  if (namespaceExists) {
    return;
  }

  const defaultNS: K8sResourceCommon = {
    metadata: {
      labels:
        operatorRequestsMonitoring && enableMonitoring
          ? {
              [OPENSHIFT_CLUSTER_MONITORING_ANNOTATION_KEY]: 'true',
            }
          : {},
      name: targetNamespace,
    },
  };

  const ns = mergeNamespaceResources(defaultNS, suggestedNamespaceTemplate);

  await kubevirtK8sCreate({ cluster, data: ns, model: NamespaceModel }).catch(
    (err: ConflictError): void => {
      ignoreConflictOrThrow(err, 'Error creating namespace: ');
    },
  );

  if (operatorRequestsMonitoring && enableMonitoring) {
    await kubevirtK8sCreate({
      cluster,
      data: getPrometheusRole(targetNamespace),
      model: RoleModel,
    });
    await kubevirtK8sCreate({
      cluster,
      data: getPrometheusRoleBinding(targetNamespace),
      model: RoleBindingModel,
    });
  }
};
