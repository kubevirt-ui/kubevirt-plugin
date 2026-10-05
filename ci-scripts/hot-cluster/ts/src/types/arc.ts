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

// The controller always creates each scale set's AutoscalingListener (and
// its Pod) in *its own* namespace, not the AutoscalingRunnerSet's -- see
// https://github.com/actions/actions-runner-controller/blob/master/controllers/actions.github.com/autoscalinglistener_controller.go
export type AutoscalingListener = {
  apiVersion: 'actions.github.com/v1alpha1';
  kind: 'AutoscalingListener';
  metadata: V1ObjectMeta;
  spec: {
    autoscalingRunnerSetName: string;
    autoscalingRunnerSetNamespace: string;
  };
};
