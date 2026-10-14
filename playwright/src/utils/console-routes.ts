/** Console paths for Virtualization routes (4.12 / uit-412). */
export const ConsoleRoutes = {
  catalog: (namespace: string) => `/k8s/ns/${namespace}/templatescatalog`,
  dataSources: () => '/k8s/all-namespaces/cdi.kubevirt.io~v1beta1~DataSource',
  dataSourcesInNamespace: (namespace: string) =>
    `/k8s/ns/${namespace}/cdi.kubevirt.io~v1beta1~DataSource`,
  migrationPolicies: () => '/k8s/all-namespaces/migrations.kubevirt.io~v1alpha1~MigrationPolicy',
  templates: () => '/k8s/all-namespaces/template.openshift.io~v1~Template',
  templatesInNamespace: (namespace: string) =>
    `/k8s/ns/${namespace}/template.openshift.io~v1~Template`,
  virtualizationOverview: () => '/k8s/all-namespaces/virtualization-overview',
  virtualMachines: () => '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine',
  virtualMachinesInNamespace: (namespace: string) =>
    `/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine`,
};

/** Default project for catalog nav before `switchProject` in specs. */
export const DEFAULT_CATALOG_NAMESPACE = 'openshift';
