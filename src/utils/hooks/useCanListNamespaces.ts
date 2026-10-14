import { useFlag } from '@openshift-console/dynamic-plugin-sdk';

/**
 * True when the console user can list namespaces cluster-wide (all projects).
 * Maps to the CAN_LIST_NS capability flag from the console host.
 */
export const useCanListNamespaces = (): boolean => useFlag('CAN_LIST_NS');
