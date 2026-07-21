export const KUBEVIRT_JSONPATCH_ANNOTATION = 'kubevirt.kubevirt.io/jsonpatch';
export const TEMPLATE_FEATURE_GATE = 'Template';
export const TEMPLATE_FEATURE_GATE_PATH =
  '/spec/configuration/developerConfiguration/featureGates/-';

export const ADD_TEMPLATE_FEATURE_GATE_PATCH = {
  op: 'add',
  path: TEMPLATE_FEATURE_GATE_PATH,
  value: TEMPLATE_FEATURE_GATE,
};

/** GVK used to detect whether HCO v1 (slice-based featureGates) is available. */
export const HYPERCONVERGED_V1_GROUP_VERSION_KIND = {
  group: 'hco.kubevirt.io',
  kind: 'HyperConverged',
  version: 'v1',
} as const;
