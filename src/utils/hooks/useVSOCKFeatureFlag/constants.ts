import { Patch } from '@openshift-console/dynamic-plugin-sdk';

export const VSOCK_FEATURE_GATE = 'VSOCK';
export const VSOCK_FEATURE_GATE_PATH = '/spec/configuration/developerConfiguration/featureGates/-';

export const ADD_VSOCK_FEATURE_GATE_PATCH: Patch = {
  op: 'add',
  path: VSOCK_FEATURE_GATE_PATH,
  value: VSOCK_FEATURE_GATE,
};
