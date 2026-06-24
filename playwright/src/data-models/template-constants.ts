export const IT_PREFS = {
  /** CentOS Stream 9 */
  CENTOS_STREAM9: 'centos.stream9',
} as const;

export const INSTANCE_TYPES = {
  /** CentOS Stream 9 */
  CENTOS_STREAM9: 'centos-stream9',
  /** CentOS Stream 10 */
  CENTOS_STREAM10: 'centos-stream10',
  /** RHEL9 OS */
  RHEL9: 'rhel9',
  /** RHEL10 OS */
  RHEL10: 'rhel10',
  /** Fedora OS */
  FEDORA: 'fedora',
  /** U series */
  U_SERIES: 'U',
  /** C series */
  CX_SERIES: 'CX',
  /** Small size */
  SMALL: 'small',
  /** Small size */
  U_SMALL: 'small: 1 CPUs, 2 GiB Memory',
  /** Medium size */
  MEDIUM: 'medium',
  /** Medium size for U series */
  U_MEDIUM: 'medium: 1 CPUs, 4 GiB Memory',
  /** Medium size for CX series with Hugepages */
  CX_MEDIUM: 'medium: 1 CPUs, 2 GiB Memory',
  /** Medium size for CX series with Hugepages */
  CX_HP_MEDIUM: 'medium1gi: 1 CPUs, 2 GiB Memory',
  /** Large size */
  LARGE: 'large',
  /** Example instance type name */
  EXAMPLE: 'example',
  /** cx1.medium instance type */
  CX1_MEDIUM: 'cx1.medium',
  /** cx1.2xlarge instance type */
  CX1_2XLARGE: 'cx1.2xlarge',
} as const;

export const TEMPLATE_NAME_PREFIXES = {
  /** Test clone template prefix */
  TEST_CLONE_TEMPLATE: 'test-clone-template',
} as const;

export const TEMPLATE_DISPLAY_NAMES = {
  /** Test clone template display name */
  TEST_CLONE_TEMPLATE: 'Test Clone Template',
  /** RHEL 8 template display name */
  RHEL8: 'Red Hat Enterprise Linux 8 VM',
  /** RHEL 9 template display name */
  RHEL9: 'Red Hat Enterprise Linux 9 VM',
  /** Fedora template display name */
  FEDORA: 'Fedora VM',
  /** CentOS Stream 9 template display name */
  CENTOS_STREAM_9: 'CentOS Stream 9 VM',
  /** Windows 11 template display name */
  WIN11: 'Microsoft Windows 11 VM',
  /** Windows Server 2022 template display name */
  WIN2K22: 'Microsoft Windows Server 2022 VM',
  /** Windows Server 2016 template display name */
  WIN2K16: 'Microsoft Windows Server 2016 VM',
  /** Windows Server 2019 template display name */
  WIN2K19: 'Microsoft Windows Server 2019 VM',
} as const;

export const OS_NAMES = {
  /** Red Hat Enterprise Linux */
  RHEL: 'Red Hat Enterprise Linux',
} as const;

export const OS_FILTERS = {
  /** RHEL OS filter */
  RHEL: 'rhel',
  /** Windows OS filter */
  WINDOWS: 'windows',
  /** Fedora OS filter */
  FEDORA: 'Fedora',
} as const;

export const WORKLOAD_FILTERS = {
  /** Server workload filter */
  SERVER: 'Server',
  /** Desktop workload filter */
  DESKTOP: 'Desktop',
} as const;

export const PROVIDER_FILTERS = {
  /** Other provider filter */
  OTHER: 'Other',
} as const;
