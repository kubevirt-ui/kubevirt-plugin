import { KUBEVIRT_INSTANCETYPE_API_VERSION } from '@/utils/constants';
import { EnvVariables } from '@/utils/env-variables';

const instancetypeConsoleSegment = KUBEVIRT_INSTANCETYPE_API_VERSION.replace('/', '~');

/** Console paths for Virtualization routes (release-4.13). */
export const ConsoleRoutes = {
  bootableVolumesInNamespace: (namespace: string) => `/k8s/ns/${namespace}/bootablevolumes`,
  /**
   * Catalog / create-VM entry (CNV-98979 multi-release):
   * - ≤4.14 (`useLegacyCatalogEntry`): `templatescatalog`
   * - 4.16–4.21: namespaced `/catalog`
   * - ≥4.22 (`useVmWizardCatalogEntry`): bare `/vm-wizard` (Create action; namespaced path 404s)
   */
  catalog: (namespace: string) => {
    if (EnvVariables.useLegacyCatalogEntry) {
      return `/k8s/ns/${namespace}/templatescatalog`;
    }
    if (EnvVariables.useVmWizardCatalogEntry) {
      return '/vm-wizard';
    }
    return `/k8s/ns/${namespace}/catalog`;
  },
  checkupsInNamespace: (namespace: string) => `/k8s/ns/${namespace}/checkups`,
  checkupsNetworkForm: (namespace: string) => `/k8s/ns/${namespace}/checkups/network/form`,
  checkupsStorage: (namespace: string) => `/k8s/ns/${namespace}/checkups/storage`,
  checkupsStorageForm: (namespace: string) => `/k8s/ns/${namespace}/checkups/storage/form`,
  clusterProjects: () => '/k8s/cluster/projects',
  clusterInstanceTypes: () =>
    `/k8s/cluster/${instancetypeConsoleSegment}~VirtualMachineClusterInstancetype`,
  clusterPreferences: () =>
    `/k8s/cluster/${instancetypeConsoleSegment}~VirtualMachineClusterPreference`,
  dataSources: () => '/k8s/all-namespaces/cdi.kubevirt.io~v1beta1~DataSource',
  dataSourcesInNamespace: (namespace: string) =>
    `/k8s/ns/${namespace}/cdi.kubevirt.io~v1beta1~DataSource`,
  instanceTypesCatalog: (namespace: string) =>
    EnvVariables.useLegacyCatalogEntry
      ? `/k8s/ns/${namespace}/templatescatalog/instanceTypes`
      : `/k8s/ns/${namespace}/catalog/instanceTypes`,
  /** Pre-wizard catalog route (tabs: Template catalog / InstanceTypes) on older console builds. */
  legacyCatalog: (namespace: string) => `/k8s/ns/${namespace}/templatescatalog`,
  legacyInstanceTypesCatalog: (namespace: string) =>
    `/k8s/ns/${namespace}/templatescatalog/instanceTypes`,
  migrationPolicies: () => '/k8s/all-namespaces/migrations.kubevirt.io~v1alpha1~MigrationPolicy',
  templateCatalog: (namespace: string) =>
    EnvVariables.useLegacyCatalogEntry
      ? `/k8s/ns/${namespace}/templatescatalog`
      : `/k8s/ns/${namespace}/catalog/template`,
  templates: () => '/k8s/all-namespaces/template.openshift.io~v1~Template',
  templatesInNamespace: (namespace: string) =>
    `/k8s/ns/${namespace}/template.openshift.io~v1~Template`,
  userInstanceTypesInNamespace: (namespace: string) =>
    `/k8s/ns/${namespace}/${instancetypeConsoleSegment}~VirtualMachineInstancetype`,
  virtualizationOverview: () => '/k8s/all-namespaces/virtualization-overview',
  /** 4.22+ cluster route when overview horizontal nav is not registered (uit-422). */
  virtualizationMigrationsInNamespace: (namespace: string) =>
    `/k8s/ns/${namespace}/virtualization-migrations`,
  virtualizationOverviewMigrations: () => '/k8s/all-namespaces/virtualization-overview/migrations',
  virtualizationOverviewSettings: () => '/k8s/all-namespaces/virtualization-overview/settings',
  /** Standalone settings (works when `virtualization-overview/settings` 404s). */
  virtualizationSettings: () => '/k8s/all-namespaces/virtualization-settings',
  virtualizationSettingsCluster: () => '/k8s/all-namespaces/virtualization-settings/cluster',
  virtualizationSettingsPreview: (namespace: string) =>
    `/k8s/ns/${namespace}/virtualization-settings/preview-features`,
  virtualizationSettingsRecommended: () =>
    '/k8s/all-namespaces/virtualization-settings/recommended',
  virtualizationSettingsUser: () => '/k8s/all-namespaces/virtualization-settings/user',
  virtualMachines: () => '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine',
  virtualMachinesInNamespace: (namespace: string) =>
    `/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine`,
  /** VM creation wizard — bare path matches the Create VirtualMachine action. */
  vmWizard: (_namespace?: string) => '/vm-wizard',
  /** Alias for {@link ConsoleRoutes.vmWizard}. */
  vmWizardCatalog: (_namespace?: string) => '/vm-wizard',
};

/** Default project for catalog nav before `switchProject` in specs. */
export const DEFAULT_CATALOG_NAMESPACE = 'openshift';
