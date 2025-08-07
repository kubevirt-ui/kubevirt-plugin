import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const ConsoleOperatorConfigModel: K8sModel = {
  abbr: 'C',
  apiGroup: 'operator.openshift.io',
  apiVersion: 'v1',
  crd: true,
  id: 'console',
  kind: 'Console',
  label: 'Console',
  labelPlural: 'Consoles',
  namespaced: false,
  plural: 'consoles',
};
