import { getClusterTeardownRules } from './teardown-rules-cluster';
import { getFilesTeardownRules } from './teardown-rules-files';
import { getNamespaceTeardownRules } from './teardown-rules-namespace';
import type { TeardownRule } from './types';

/**
 * Returns ordered global teardown rules (NAMESPACE → CLUSTER → FILES).
 * Each rule handles errors internally and must not throw.
 */
export function getTeardownRules(): TeardownRule[] {
  return [...getNamespaceTeardownRules(), ...getClusterTeardownRules(), ...getFilesTeardownRules()];
}
