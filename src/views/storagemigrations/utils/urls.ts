import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { MultiNamespaceVirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';

/**
 * List URL for native storage migration plans.
 * Uses the CRD GVK path so OpenShift Console resolves a real resource type
 * instead of the synthetic "storagemigrations" plural (which 404s when the
 * custom console.page/route is not active).
 */
export const getStorageMigrationsListUrl = (namespace?: string): string =>
  getResourceUrl({
    activeNamespace: namespace || ALL_NAMESPACES_SESSION_KEY,
    model: MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  });
