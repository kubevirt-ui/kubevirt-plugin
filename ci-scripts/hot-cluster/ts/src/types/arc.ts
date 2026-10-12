/**
 * Actions Runner Controller (ARC) CRD types.
 */

import type { V1ObjectMeta } from '@kubernetes/client-node';

export type AutoscalingRunnerSet = {
  apiVersion: 'actions.github.com/v1alpha1';
  kind: 'AutoscalingRunnerSet';
  metadata: V1ObjectMeta;
  spec: {
    githubConfigUrl?: string;
    maxRunners?: number;
    minRunners?: number;
  };
  status?: {
    currentRunners?: number;
    pendingEphemeralRunners?: number;
    runningEphemeralRunners?: number;
    state?: string;
  };
};
