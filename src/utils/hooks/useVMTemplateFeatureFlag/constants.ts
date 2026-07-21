import { HyperConvergedModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';

export const KUBEVIRT_JSONPATCH_ANNOTATION = 'kubevirt.kubevirt.io/jsonpatch';
export const TEMPLATE_FEATURE_GATE = 'Template';
export const TEMPLATE_FEATURE_GATE_PATH =
  '/spec/configuration/developerConfiguration/featureGates/-';

export const ADD_TEMPLATE_FEATURE_GATE_PATCH = {
  op: 'add',
  path: TEMPLATE_FEATURE_GATE_PATH,
  value: TEMPLATE_FEATURE_GATE,
};

/**
 * Pinned to HCO v1 for availability detection (slice-based featureGates).
 * HyperConvergedModelGroupVersionKind is v1beta1.
 */
export const HyperConvergedV1GroupVersionKind = {
  ...HyperConvergedModelGroupVersionKind,
  version: 'v1',
} as const;
