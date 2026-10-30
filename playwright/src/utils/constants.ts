export const KUBEADMIN_USERNAME = 'kubeadmin';
export const KUBEADMIN_IDP = 'kube:admin';

export const E2E_LABEL = 'kubevirt-plugin-e2e';
export const E2E_LABEL_VALUE = 'true';

/** Console list/detail URLs for InstanceType CRDs on OpenShift 4.13 (KubeVirt v1alpha2). */
export const KUBEVIRT_INSTANCETYPE_API_VERSION = 'instancetype.kubevirt.io/v1alpha2';

export enum K8sKind {
  Template = 'Template',
  VM = 'VirtualMachine',
}

/** Catalog review wizard (`templatescatalog/review`) horizontal nav. */
export enum CatalogReviewTabTestId {
  Disks = 'horizontal-link-Disks',
  Environment = 'horizontal-link-Environment',
  Metadata = 'horizontal-link-Metadata',
  Networks = 'horizontal-link-Network interfaces',
  Overview = 'horizontal-link-Overview',
  Scheduling = 'horizontal-link-Scheduling',
  Scripts = 'horizontal-link-Scripts',
  YAML = 'horizontal-link-YAML',
}

export enum VmTabTestId {
  /** 4.13+ VM detail — top-level Configuration tab (`horizontal-link-${label}` → Configuration). */
  Configuration = 'horizontal-link-Configuration',
  Console = 'horizontal-link-Console',
  Details = 'horizontal-link-Details',
  Diagnostics = 'horizontal-link-Diagnostics',
  Disks = 'horizontal-link-Disks',
  Environment = 'horizontal-link-Environment',
  Events = 'horizontal-link-Events',
  Metadata = 'horizontal-link-Metadata',
  Metrics = 'horizontal-link-Metrics',
  Networks = 'horizontal-link-Network interfaces',
  Overview = 'horizontal-link-Overview',
  Parameters = 'horizontal-link-Parameters',
  Scheduling = 'horizontal-link-Scheduling',
  Scripts = 'horizontal-link-Scripts',
  Snapshots = 'horizontal-link-Snapshots',
  YAML = 'horizontal-link-YAML',
}

/** VM detail configuration tabs that expose the sidebar YAML editor switch. */
export const VM_DETAIL_SIDEBAR_YAML_TABS: VmTabTestId[] = [
  VmTabTestId.Details,
  VmTabTestId.Scheduling,
  VmTabTestId.Networks,
  VmTabTestId.Disks,
  VmTabTestId.Scripts,
];

/** Red Hat instance-type series card on InstanceTypes catalog (4.14+ clusters use U series). */
export const DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES = /U series|General Purpose|N Series/i;

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

export const TEMPLATE_WIN2K16 = {
  metadataName: 'windows2k16-server-medium',
  name: 'Microsoft Windows Server 2016 VM',
};

export const TEMPLATE_WIN2K19 = {
  metadataName: 'windows2k19-server-medium',
  name: 'Microsoft Windows Server 2019 VM',
};

/** common-templates removed Windows Server 2012 R2 (CNV-41784); not present on unpinned CNV. */
export const TEMPLATE_WIN2K22 = {
  metadataName: 'windows2k22-server-medium',
  name: 'Microsoft Windows Server 2022 VM',
};

export const VM_FROM_WINDOWS_CATALOG = {
  name: 'pw-win10-quick',
  templateMetadataName: TEMPLATE_WIN10.metadataName,
};

/** HTTP import for catalog customize (override via env in CI). */
export const CATALOG_DISK_HTTP_IMAGE_URL =
  process.env.CATALOG_DISK_HTTP_IMAGE_URL ??
  'https://download.cirros-cloud.net/0.5.2/cirros-0.5.2-x86_64-disk.img';

/** Registry import for catalog customize. */
export const CATALOG_DISK_REGISTRY_IMAGE =
  process.env.CATALOG_DISK_REGISTRY_IMAGE ??
  'quay.io/kubevirt/fedora-with-test-tooling-container-disk:latest';

/** Clone an existing cluster PVC (OS images namespace). */
export const CATALOG_DISK_PVC_CLONE_NAMESPACE =
  process.env.CATALOG_DISK_PVC_CLONE_NAMESPACE ?? 'openshift-virtualization-os-images';

/** Match prefix of PVC name (suffix is image build hash). */
export const CATALOG_DISK_PVC_CLONE_NAME_PREFIX =
  process.env.CATALOG_DISK_PVC_CLONE_NAME_PREFIX ?? 'rhel9';

/** InstanceTypes catalog boot volume (fedora boots faster than rhel9 in CI). */
export const CATALOG_INSTANCE_TYPES_BOOT_VOLUME = 'fedora';

/** `windows10-desktop-medium` catalog tile / customize default disk size. */
export const WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB = 60;

export const CRUD_NAMES = {
  clusterPreferenceExample: 'example',
  dataSourceExample: 'example',
  dataSourceForm: 'datasource-auto-test',
  instanceTypeExample: 'example',
  migrationPolicyExample: 'example',
  migrationPolicyForm: 'policy-auto-test',
  templateE2e: 'pw-template-e2e',
  /** Default name in console Template YAML editor (matches DataSource `example` pattern). */
  templateExample: 'example',
  vmExample: 'example',
};

export const DATASOURCE_FORM = {
  cron: '0 0 * * 2',
  imageUrl: 'docker://quay.io/containerdisks/centos:7-2009',
};
