import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { MultiNamespaceVirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';

/**
 * Console list URL for native live storage class migration plans
 * (`MultiNamespaceVirtualMachineStorageMigrationPlan`).
 *
 * On 4.20 the UI previously linked to the synthetic plural `/storagemigrations`,
 * which 404s ("resource type storagemigrations") because that is not a real CRD.
 * Route via the CRD GVK instead — the same fallback 4.22 uses for CNV < 4.23.
 */
export const getStorageMigrationsListUrl = (namespace?: string): string =>
  getResourceUrl({
    activeNamespace: namespace || ALL_NAMESPACES_SESSION_KEY,
    model: MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  });
