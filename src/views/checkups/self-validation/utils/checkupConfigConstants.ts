import { CHECKUP_LABEL_VALUES } from '../../utils/constants';

export const SELF_VALIDATION_LABEL_VALUE = CHECKUP_LABEL_VALUES.SELF_VALIDATION;
export const SELF_VALIDATION_NAME = 'ocp-virt-self-validation';
export const SELF_VALIDATION_RESULTS_KEY = 'self-validation-results';
export const SELF_VALIDATION_RESULTS_URL_KEY = 'detailed_results_url';
export const SELF_VALIDATION_RESULTS_FILE_KEY = 'detailed_results_file';
export const SELF_VALIDATION_RESULTS_ONLY_LABEL = 'results-only';

export const SELF_VALIDATION_CHECKUP_IMAGE_KEY = 'checkup-image';
export const SELF_VALIDATION_TEST_SUITES_KEY = 'test-suites';
export const SELF_VALIDATION_TEST_SKIPS_KEY = 'test-skips';
export const SELF_VALIDATION_DRY_RUN_KEY = 'dry-run';
export const SELF_VALIDATION_ACCEPT_WINDOWS_EULA_KEY = 'accept-windows-eula';
export const SELF_VALIDATION_WIN_IMAGE_DOWNLOAD_URL_KEY = 'win-image-download-url';
export const WINDOWS_EULA_URL = 'https://www.microsoft.com/UseTerms/#areaheading-uid673824';
export const WINDOWS_GOLDEN_IMAGE_MANIFEST_URL =
  'https://raw.githubusercontent.com/openshift-cnv/ocp-virt-validation-checkup/main/manifests/windows/golden-image.yaml';
export const MAX_WIN_IMAGE_DOWNLOAD_URL_LENGTH = 2048;
export const LEGACY_WIN_IMAGE_NAME_KEY = 'win-image-name';
export const SELF_VALIDATION_STORAGE_CLASS_KEY = 'storage-class';
export const SELF_VALIDATION_STORAGE_CAPABILITIES_KEY = 'storage-capabilities';
export const SELF_VALIDATION_PVC_SIZE_KEY = 'pvc-size';

export const selfValidationCheckupImageSettings = {
  fallback:
    'registry-proxy.engineering.redhat.com/rh-osbs/container-native-virtualization-ocp-virt-validation-checkup-rhel9:v4.20.0-128',
  name: 'ocp-virt-validation-checkup',
};

export const TEST_SUITE_COMPUTE = 'compute';
export const TEST_SUITE_NETWORK = 'network';
export const TEST_SUITE_STORAGE = 'storage';
export const TEST_SUITE_SSP = 'ssp';
export const TEST_SUITE_TIER2 = 'tier2';

export const TEST_SUITES = [
  TEST_SUITE_COMPUTE,
  TEST_SUITE_NETWORK,
  TEST_SUITE_STORAGE,
  TEST_SUITE_SSP,
  TEST_SUITE_TIER2,
];

export const TEST_SUITE_OPTIONS = [
  { label: 'Compute', value: TEST_SUITE_COMPUTE },
  { label: 'Network', value: TEST_SUITE_NETWORK },
  { label: 'Storage', value: TEST_SUITE_STORAGE },
  { label: 'SSP', value: TEST_SUITE_SSP },
  { label: 'Tier2', value: TEST_SUITE_TIER2 },
];

export const STORAGE_CAPABILITY_STORAGE_CLASS_RHEL = 'storageClassRhel';
export const STORAGE_CAPABILITY_STORAGE_CLASS_WINDOWS = 'storageClassWindows';
export const STORAGE_CAPABILITY_STORAGE_RWX_BLOCK = 'storageRWXBlock';
export const STORAGE_CAPABILITY_STORAGE_RWX_FILESYSTEM = 'storageRWXFileSystem';
export const STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM = 'storageRWOFileSystem';
export const STORAGE_CAPABILITY_STORAGE_RWO_BLOCK = 'storageRWOBlock';
export const STORAGE_CAPABILITY_STORAGE_CLASS_CSI = 'storageClassCSI';
export const STORAGE_CAPABILITY_STORAGE_SNAPSHOT = 'storageSnapshot';
export const STORAGE_CAPABILITY_ONLINE_RESIZE = 'onlineResize';
export const STORAGE_CAPABILITY_WFFC = 'WFFC';

export const STORAGE_CAPABILITIES = [
  STORAGE_CAPABILITY_STORAGE_CLASS_RHEL,
  STORAGE_CAPABILITY_STORAGE_CLASS_WINDOWS,
  STORAGE_CAPABILITY_STORAGE_RWX_BLOCK,
  STORAGE_CAPABILITY_STORAGE_RWX_FILESYSTEM,
  STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM,
  STORAGE_CAPABILITY_STORAGE_RWO_BLOCK,
  STORAGE_CAPABILITY_STORAGE_CLASS_CSI,
  STORAGE_CAPABILITY_STORAGE_SNAPSHOT,
  STORAGE_CAPABILITY_ONLINE_RESIZE,
  STORAGE_CAPABILITY_WFFC,
];

export const STORAGE_CAPABILITY_OPTIONS = [
  { label: 'StorageClass RHEL', value: STORAGE_CAPABILITY_STORAGE_CLASS_RHEL },
  { label: 'StorageClass Windows', value: STORAGE_CAPABILITY_STORAGE_CLASS_WINDOWS },
  { label: 'Storage RWX Block', value: STORAGE_CAPABILITY_STORAGE_RWX_BLOCK },
  { label: 'Storage RWX FileSystem', value: STORAGE_CAPABILITY_STORAGE_RWX_FILESYSTEM },
  { label: 'Storage RWO FileSystem', value: STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM },
  { label: 'Storage RWO Block', value: STORAGE_CAPABILITY_STORAGE_RWO_BLOCK },
  { label: 'StorageClass CSI', value: STORAGE_CAPABILITY_STORAGE_CLASS_CSI },
  { label: 'Storage Snapshot', value: STORAGE_CAPABILITY_STORAGE_SNAPSHOT },
  { label: 'Online Resize', value: STORAGE_CAPABILITY_ONLINE_RESIZE },
  { label: 'WFFC', value: STORAGE_CAPABILITY_WFFC },
];
