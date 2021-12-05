import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';
import { modelForGroupKind } from '@openshift-console/dynamic-plugin-sdk-internal-kubevirt';

import { apiVersionForModel, referenceForModel } from './k8s-ref';

export const getKubevirtModelAvailableVersion = (model: K8sModel): string =>
  modelForGroupKind(model.apiGroup, model.kind)?.apiVersion || model.apiVersion;

export const kubevirtReferenceForModel = (model: K8sModel): string =>
  referenceForModel(modelForGroupKind(model.apiGroup, model.kind) || model);

export const getKubevirtAvailableModel = (model: K8sModel): K8sModel =>
  modelForGroupKind(model.apiGroup, model.kind) || model;

export const getKubevirtModelAvailableAPIVersion = (model: K8sModel): string =>
  apiVersionForModel(modelForGroupKind(model.apiGroup, model.kind) || model);
