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
