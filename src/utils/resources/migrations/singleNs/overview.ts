import { getNamespace } from '@kubevirt-utils/resources/shared';

import type {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  VirtualMachineStorageMigrationPlan,
} from '../constants';

/**
 * Normalizes a single-namespace VirtualMachineStorageMigrationPlan into the
 * MultiNamespaceVirtualMachineStorageMigrationPlan shape so all existing
 * status-tracking utilities can be used without modification.
 * @param plan
 */
export const normalizeSingleNsPlan = (
  plan: VirtualMachineStorageMigrationPlan,
): MultiNamespaceVirtualMachineStorageMigrationPlan | undefined =>
  plan
    ? {
        ...plan,
        spec: {
          namespaces: [
            {
              name: getNamespace(plan),
              retentionPolicy: plan.spec?.retentionPolicy,
              virtualMachines: plan.spec?.virtualMachines ?? [],
            },
          ],
        },
        status: plan.status ? { namespaces: [plan.status] } : undefined,
      }
    : undefined;
