export const KUBEADMIN_USERNAME = 'kubeadmin';
export const KUBEADMIN_IDP = 'kube:admin';

export const E2E_LABEL = 'kubevirt-plugin-e2e';
export const E2E_LABEL_VALUE = 'true';

export enum K8sKind {
  VM = 'VirtualMachine',
  Template = 'Template',
}

/** Catalog review wizard (`templatescatalog/review`) horizontal nav. */
export enum CatalogReviewTabTestId {
  Overview = 'horizontal-link-Overview',
  YAML = 'horizontal-link-YAML',
  Scheduling = 'horizontal-link-Scheduling',
  Environment = 'horizontal-link-Environment',
  Networks = 'horizontal-link-Network interfaces',
  Disks = 'horizontal-link-Disks',
  Scripts = 'horizontal-link-Scripts',
  Metadata = 'horizontal-link-Metadata',
}

export enum VmTabTestId {
  Overview = 'horizontal-link-Overview',
  Details = 'horizontal-link-Details',
  Metrics = 'horizontal-link-Metrics',
  YAML = 'horizontal-link-YAML',
  Scheduling = 'horizontal-link-Scheduling',
  Environment = 'horizontal-link-Environment',
  Events = 'horizontal-link-Events',
  Console = 'horizontal-link-Console',
  Networks = 'horizontal-link-Network interfaces',
  Disks = 'horizontal-link-Disks',
  Scripts = 'horizontal-link-Scripts',
  Snapshots = 'horizontal-link-Snapshots',
  Parameters = 'horizontal-link-Parameters',
}

/** VM detail configuration tabs that expose the sidebar YAML editor switch. */
export const VM_DETAIL_SIDEBAR_YAML_TABS: VmTabTestId[] = [
  VmTabTestId.Details,
  VmTabTestId.Scheduling,
  VmTabTestId.Networks,
  VmTabTestId.Disks,
  VmTabTestId.Scripts,
];

export const TEMPLATE_RHEL9 = {
  metadataName: 'rhel9-server-small',
  name: 'Red Hat Enterprise Linux 9.0 VM',
};

export const VM_FROM_CATALOG = {
  name: 'pw-rhel9-quick',
  templateMetadataName: 'rhel9-server-small',
};

export const TEMPLATE_WIN10 = {
  metadataName: 'windows10-desktop-medium',
  name: 'Microsoft Windows 10 VM',
};

export const VM_FROM_WINDOWS_CATALOG = {
  name: 'pw-win10-quick',
  templateMetadataName: TEMPLATE_WIN10.metadataName,
};

/** Cypress `DiskSource.URL` — HTTP import for catalog customize (override via env in CI). */
export const CATALOG_DISK_HTTP_IMAGE_URL =
  process.env.CATALOG_DISK_HTTP_IMAGE_URL ??
  'https://download.cirros-cloud.net/0.5.2/cirros-0.5.2-x86_64-disk.img';

/** Cypress `DiskSource.REGISTRY` — registry import for catalog customize. */
export const CATALOG_DISK_REGISTRY_IMAGE =
  process.env.CATALOG_DISK_REGISTRY_IMAGE ??
  'quay.io/kubevirt/fedora-with-test-tooling-container-disk:latest';

/** Cypress `DiskSource.PVC` — clone an existing cluster PVC (OS images namespace). */
export const CATALOG_DISK_PVC_CLONE_NAMESPACE =
  process.env.CATALOG_DISK_PVC_CLONE_NAMESPACE ?? 'openshift-virtualization-os-images';

/** Match prefix of PVC name (suffix is image build hash). */
export const CATALOG_DISK_PVC_CLONE_NAME_PREFIX =
  process.env.CATALOG_DISK_PVC_CLONE_NAME_PREFIX ?? 'rhel9';

/** `windows10-desktop-medium` catalog tile / customize default disk size. */
export const WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB = 60;

export const CRUD_NAMES = {
  dataSourceExample: 'example',
  dataSourceForm: 'datasource-auto-test',
  migrationPolicyExample: 'example',
  migrationPolicyForm: 'policy-auto-test',
  templateE2e: 'pw-template-e2e',
  /** Default name in console Template YAML editor (matches DataSource `example` pattern). */
  templateExample: 'example',
  vmExample: 'example',
};

export const DATASOURCE_FORM = {
  imageUrl: 'docker://quay.io/containerdisks/centos:7-2009',
  cron: '0 0 * * 2',
};
