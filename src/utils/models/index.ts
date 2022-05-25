import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export * from '@kubevirt-ui/kubevirt-api/console';

export const UploadTokenRequestModel: K8sModel = {
  label: 'Upload Token Request',
  labelPlural: 'Upload Token Requests',
  apiVersion: 'v1beta1',
  apiGroup: 'upload.cdi.kubevirt.io',
  namespaced: true,
  plural: 'uploadtokenrequests',
  abbr: 'utr',
  kind: 'UploadTokenRequest',
  id: 'uploadtokenrequest',
  crd: true,
};
