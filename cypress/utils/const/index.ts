export const adminOnlyDescribe = !Cypress.env('NON_PRIV') ? describe : xdescribe;
export const adminOnlyIT = !Cypress.env('NON_PRIV') ? it : xit;
export const nonPrivIT = Cypress.env('NON_PRIV') ? it : xit;
export const gpuDescribe = Cypress.env('GPU') ? describe : xdescribe;
export const snoDescribe = Cypress.env('SNO') ? describe : xdescribe;
export const sriovDescribe = Cypress.env('SRIOV') ? describe : xdescribe;
export const nnsDescribe =
  !Cypress.env('NON_PRIV') &&
  Cypress.env('NNCP_NIC') &&
  (Cypress.env('NNCP_NIC') == 'ens10' || Cypress.env('NNCP_NIC') == 'enp10s0')
    ? describe
    : xdescribe;

export const nnsIT =
  !Cypress.env('NON_PRIV') &&
  Cypress.env('NNCP_NIC') &&
  (Cypress.env('NNCP_NIC') == 'ens10' || Cypress.env('NNCP_NIC') == 'enp10s0')
    ? it
    : xit;
export const mtcDescribe = !Cypress.env('NON_PRIV') && Cypress.env('MTC') ? describe : xdescribe;
export const dsIT = Cypress.env('DOWNSTREAM') ? it : xit;
export const QUICK_VM_IT_NAME = 'vm-it-quick';
export const CUST_VM_IT_NAME = 'vm-it-custom';
export const QUICK_VM_TMPL_NAME = 'vm-template-quick';
export const CUST_VM_TMPL_NAME = 'vm-template-custom';
export const TEST_NS = 'auto-test-ns';
export const OCP_NS = 'openshift'; // use default can reduce flaky
export const TEST_VM_NAME = 'auto-test-vm';
export const TEST_IT_NAME = 'auto-it-vm';
export const TEST_PVC_NAME = 'auto-test-pvc';
export const DEFAULT_VM_NAME = 'example';
export const DEFAULT_TEMPLATE_NAME = 'example';
export const OS_IMAGES_NS = Cypress.env('OS_IMAGES_NS');
export const CNV_NS = Cypress.env('CNV_NS');
export const POLICY_NAME = 'policy-auto-test';
export const DATASOURCE_NAME = 'datasource-auto-test';
export const YAML_DS_NAME = 'example';
export const YAML_MP_NAME = 'example';
export const LOCAL_IMAGE = Cypress.env('LOCAL_IMAGE');
export const ARTIFACTORY_SERVER = Cypress.env('ARTIFACTORY_SERVER');
export const ARTIFACTORY_PATH = Cypress.env('ARTIFACTORY_PATH');
export const CIRROS_IMAGE = Cypress.env('CIRROS_IMAGE');
export const URL_IMAGE = `https://${ARTIFACTORY_SERVER}/${ARTIFACTORY_PATH}/cnv-tests/rhel-images/rhel-92.qcow2`;
export const CONTAINER_IMAGE = 'quay.io/containerdisks/fedora:latest';
export const QUAY_CONTAINER_IMAGE = 'quay.io/openshift-cnv/qe-cnv-tests-fedora:40';
export const DATASOURCE_IMAGE = 'quay.io/containerdisks/centos:7-2009';
export const DATASOURCE_CRON = '0 0 * * 2';
export const ALL_PROJ_NS = 'All Projects';
export const CLEANUP_SCRIPT = './utils/cleanup.sh';
export const DUMP_SCRIPT = './utils/dump.sh';
export const TEST_SECRET_NAME = 'auto-test-secret';
export const RSA_SECRET_NAME = 'auto-rsa-secret';
export const QUAY_USER = 'openshift-cnv+cnv_qe_internal_read_only';
export const QUAY_USER_PASSWD = '9T8B4VWWRPTEZFFB6GOQ79C64VMTYFCKUM35B640AY71X379IFX8VR6GQX8DX94I';
export const QUAY_UL_URL = 'quay.io/rhn_support_lkladnit/lkladnit';
export const QUAY_UL_USER = 'rhn_support_lkladnit';
export const QUAY_UL_PASSWD = 'Vf9R1KcprFNqdQf';
export const TREEVIEW_ROOT_ID = '#vms-tree-view-panel';
export const EXAMPLE = 'example';
export const TEST_ROUTE_NAME = 'auto-test-route';
export const TEST_POL_NAME = 'auto-test-net-policy';
export const TEST_MULTI_NAME = 'auto-test-multi-policy';

// VM Status
export enum VM_STATUS {
  DataVolumeError = 'DataVolumeError',
  Migrating = 'Migrating',
  Paused = 'Paused',
  Provisioning = 'Provisioning',
  Running = 'Running',
  Starting = 'Starting',
  Stopped = 'Stopped',
  Stopping = 'Stopping',
}

export enum VM_ACTION {
  Cancel = 'Cancel Virtual Machine Migration',
  Clone = 'Clone',
  Delete = 'Delete',
  Migrate = 'Migrate',
  Pause = 'Pause',
  Restart = 'Restart',
  Start = 'Start',
  Stop = 'Stop',
  Unpause = 'Unpause',
}

export enum ACTION_TIMEOUT {
  IMPORT = 900000,
  Migrating = 180000,
  START = 60000,
  STOP = 600000,
}

export enum K8S_KIND {
  DS = 'DataSource',
  DV = 'DataVolume',
  MP = 'MigrationPolicy',
  NAD = 'net-attach-def',
  NNCP = 'NodeNetworkConfigurationPolicy',
  Project = 'project',
  PVC = 'PersistentVolumeClaim',
  Secret = 'Secret',
  Template = 'Template',
  VM = 'VirtualMachine',
  VMCI = 'VirtualMachineClusterInstancetype',
  VMCP = 'VirtualMachineClusterPreference',
  VMI = 'VirtualMachineInstance',
}

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;

export const envVars = [
  'ARTIFACTORY_PATH',
  'ARTIFACTORY_SERVER',
  'ARTIFACTORY_TOKEN',
  'BRIDGE_KUBEADMIN_PASSWORD',
  'CIRROS_IMAGE',
  'CNV_NS',
  'CNV_QE_SERVER',
  'DOWNSTREAM',
  'GPU',
  'LOCAL_IMAGE',
  'MTC',
  'NNCP_NIC',
  'NON_PRIV',
  'OS_IMAGES_NS',
  'SNO',
  'STORAGE_CLASS',
  'FIRST_NODE',
  'SECOND_NODE',
  'THIRD_NODE',
];
