import { Patch } from '@openshift-console/dynamic-plugin-sdk';

export { KUBEVIRT_JSONPATCH_ANNOTATION } from '@kubevirt-utils/hooks/utils/featureGateAnnotation';

export const TEMPLATE_FEATURE_GATE = 'Template';
export const TEMPLATE_FEATURE_GATE_PATH =
  '/spec/configuration/developerConfiguration/featureGates/-';

export const ADD_TEMPLATE_FEATURE_GATE_PATCH: Patch = {
  op: 'add',
  path: TEMPLATE_FEATURE_GATE_PATH,
  value: TEMPLATE_FEATURE_GATE,
};
