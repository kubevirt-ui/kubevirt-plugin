import { escapePromLabelValue } from '@kubevirt-utils/utils/prometheus';

import { OUTDATED_GUEST_DEVICE_DRIVERS_RECORDING_RULE } from './constants';

/**
 * Builds a PromQL query that returns one series per VM with outdated guest device drivers.
 * Optionally scopes to a namespace and/or VM name.
 */
export const buildOutdatedVirtioDriversQuery = (namespace?: string, name?: string): string => {
  const labelMatchers: string[] = ['namespace!=""'];

  if (namespace) {
    labelMatchers[0] = `namespace="${escapePromLabelValue(namespace)}"`;
  }

  if (name) {
    labelMatchers.push(`name="${escapePromLabelValue(name)}"`);
  }

  return `count by (cluster, namespace, name) (${OUTDATED_GUEST_DEVICE_DRIVERS_RECORDING_RULE}{${labelMatchers.join(',')}})`;
};
