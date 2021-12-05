import * as _ from 'lodash';

import { GroupVersionKind, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  ExtensionK8sGroupModel,
  K8sKind,
} from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';
import { modelFor } from '@openshift-console/dynamic-plugin-sdk-internal-kubevirt';

export const groupVersionFor = (apiVersion: string) => ({
  group: apiVersion.split('/').length === 2 ? apiVersion.split('/')[0] : 'core',
  version: apiVersion.split('/').length === 2 ? apiVersion.split('/')[1] : apiVersion,
});

// TODO(alecmerdler): Replace all manual string building with this function
export const referenceForGroupVersionKind =
  (group: string) => (version: string) => (kind: string) =>
    [group, version, kind].join('~');

export const referenceForModel = (model: K8sKind): GroupVersionKind =>
  referenceForGroupVersionKind(model.apiGroup || 'core')(model.apiVersion)(model.kind);

export const referenceForExtensionModel = (model: ExtensionK8sGroupModel): GroupVersionKind =>
  referenceForGroupVersionKind(model?.group || 'core')(model?.version)(model?.kind);

export const apiVersionForModel = (model: K8sKind) =>
  _.isEmpty(model.apiGroup) ? model.apiVersion : `${model.apiGroup}/${model.apiVersion}`;

export const referenceFor = ({ kind, apiVersion }: K8sResourceCommon): GroupVersionKind => {
  if (!kind) {
    return '';
  }

  // `apiVersion` is optional in some k8s object references (for instance,
  // event `involvedObject`). The CLI resolves the version from API discovery.
  // Use `modelFor` to get the version from the model when missing.
  if (!apiVersion) {
    const m = modelFor(kind);
    return m ? referenceForModel(m) : '';
  }

  const { group, version } = groupVersionFor(apiVersion);
  return referenceForGroupVersionKind(group)(version)(kind);
};
