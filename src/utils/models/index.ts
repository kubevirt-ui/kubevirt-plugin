import VirtualMachineRestoreModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineRestoreModel';
import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export * from '@kubevirt-ui/kubevirt-api/console';

export const UploadTokenRequestModel: K8sModel = {
  abbr: 'utr',
  apiGroup: 'upload.cdi.kubevirt.io',
  apiVersion: 'v1beta1',
  crd: true,
  id: 'uploadtokenrequest',
  kind: 'UploadTokenRequest',
  label: 'Upload Token Request',
  labelPlural: 'Upload Token Requests',
  namespaced: true,
  plural: 'uploadtokenrequests',
};

export const QuickStartModel: K8sModel = {
  abbr: 'CQS',
  apiGroup: 'console.openshift.io',
  apiVersion: 'v1',
  crd: true,
  kind: 'ConsoleQuickStart',
  label: 'ConsoleQuickStart',
  labelPlural: 'ConsoleQuickStarts',
  namespaced: false,
  plural: 'consolequickstarts',
  propagationPolicy: 'Background',
};

export const V1Alpha1VirtualMachineSnapshotModel = {
  ...VirtualMachineSnapshotModel,
  apiVersion: 'v1alpha1',
};

export const V1Alpha1VirtualMachineRestoreModel = {
  ...VirtualMachineRestoreModel,
  apiVersion: 'v1alpha1',
};
