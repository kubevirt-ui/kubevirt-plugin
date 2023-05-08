import { K8sKind } from '@openshift-console/dynamic-plugin-sdk';

export const ServiceBindingModel: K8sKind = {
  id: 'servicebinding',
  kind: 'ServiceBinding',
  plural: 'servicebindings',
  label: 'ServiceBinding',
  // t('kubevirt-plugin~plugin~ServiceBinding')
  labelKey: 'kubevirt-plugin~plugin~ServiceBinding',
  labelPlural: 'ServiceBindings',
  // t('kubevirt-plugin~plugin~ServiceBindings')
  labelPluralKey: 'kubevirt-plugin~plugin~ServiceBindings',
  abbr: 'SB',
  apiGroup: 'binding.operators.coreos.com',
  apiVersion: 'v1alpha1',
  namespaced: true,
  crd: true,
};
