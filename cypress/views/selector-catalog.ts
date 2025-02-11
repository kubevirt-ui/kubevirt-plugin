export const GRID = '#vm-catalog-grid';
export const vmCatalog = '.vm-catalog-grid-tile';
export const filterText = '#filter-text-input';
export const checkbox = '[type="checkbox"]';
export const quickForm = '#quick-create-form';
export const templateTab = '[data-test="templates-tab"]';
export const instanceTab = '[data-test="instancetypes-tab"]';

// project
export const projectDropdown = '.templates-catalog-project-dropdown';
export const projectItem = '.pf-v5-c-context-selector__menu-list-item';
export const allItems = '[data-test-id="catalog-template-filter-all-items"]';
export const listBtn = '#template-list-btn';
export const gridBtn = '#template-grid-btn';

// filter by OS Name
export const RHEL = '[data-test-id="osName-RHEL"]';
export const FEDORA = '[data-test-id="osName-Fedora"]';
export const CENTOS = '[data-test-id="osName-CentOS"]';
export const WINDOWS = '[data-test-id="osName-Windows"]';
export const OTHER = '[data-test-id="osName-Windows"]';

// filter by workload
export const DESKTOP = '[data-test-id="workload-Desktop"]';
export const SERVER = '[data-test-id="workload-Server"]';

// filter by boot source
export const BootSource = '[data-test-id="boot-source-available-Boot source available"]';
export const deprecated = '[data-test-id="hideDeprecatedTemplates-Hide deprecated templates"]';

// template info
export const customizeVMBtn = '[data-test-id="customize-vm-btn"]';
export const quickCreateVMBtn = '[data-test-id="quick-create-vm-btn"]';
export const vmName = '[data-test-id="template-catalog-vm-name-input"]';
export const uTemplate = '#user-templates';

// review and create
export const vmCustomizeName = '#vm-customize-NAME';
export const bootFromCD = '[data-test-id="boot-cd"]';
export const fillISOURL = 'input[data-test-id="cd-boot-source-http-source-input"]';
export const cdSourceDropDown = '[data-test-id="cd-boot-source"]';
export const diskSourceDropDown = '[data-test-id="disk-boot-source"]';
export const winDrivers = '[data-test-id="cdrom-drivers"]';

export enum diskSource {
  Blank = '[data-test-id="blank"]',
  Default = '[data-test-id="default"]',
  PVC = '[data-test-id="pvc-clone"]',
  PVCNameBtn = '[data-test-id="disk-boot-source-pvc-select-pvc-name-select-dropdown"]',
  PVCNSBtn = '[data-test-id="disk-boot-source-pvc-select-project-select-dropdown"]',
  Registry = '[data-test-id="registry"]',
  RegistryH = '#disk-boot-source-registry-helper',
  RegistryV = '[data-test-id="disk-boot-source-container-source-input"]',
  UploadBtnMenu = '.pf-v5-c-menu__item-main',
  UploadBtnText = 'Upload (Upload a new file to a PVC)',
  URL = '[data-test-id="http"]',
  URLH = '#disk-boot-source-http',
  URLV = '[data-test-id="disk-boot-source-http-source-input"]',
}

export enum cdSource {
  PVC = '[data-test-id="pvc-clone"]',
  PVCNameBtn = '[data-test-id="cd-boot-source-pvc-select-pvc-name-select-dropdown"]',
  PVCNSBtn = '[data-test-id="cd-boot-source-pvc-select-project-select-dropdown"]',
  Registry = '[data-test-id="container-disk"]',
  RegistryH = '#cd-boot-source-registry-helper',
  RegistryV = '[data-test-id="cd-boot-source-container-source-input"]',
  UploadBtnMenu = '.pf-v5-c-select__menu-item-main',
  UploadBtnText = 'Upload (Upload a new file to a PVC)',
  URL = '[data-test-id="http"]',
  URLH = '#cd-boot-source-http',
  URLV = '[data-test-id="cd-boot-source-http-source-input"]',
}

export const PVCNS = (name: string) => `[data-test-id="${name}"]`;
export const PVCName = (name: string) =>
  `[data-test-id="disk-boot-source-pvc-select-pvc-name-select-dropdown-option-${name}"]`;
export const customizeVMSubmitBtn = '[data-test-id="customize-vm-submit-button"]';

// create vm
export const startOnCreation = '#start-after-create-checkbox';
export const createBtnText = 'Create VirtualMachine';
export const createWithNoBS = 'Create with no available boot source';

// Overview
export const nameEditBtn = '[data-test-id="wizard-overview-name-edit"]';
export const nameInput = '#vm-name';
export const descEditBtn = '[data-test-id="wizard-overview-description-edit"]';
export const descText = '[aria-label="description text area"]';
export const cpuEditBtn = '[data-test-id="wizard-overview-cpu-memory-edit"]';
export const cpuField = '.input-cpu';
export const memField = '.input-memory';
export const restoreSetting = 'Restore template settings';
export const bootModeEditBtn = '[data-test-id="wizard-overview-boot-method-edit"]';
export const menuToggle = 'button.pf-v5-c-menu-toggle';
export const menuItemMain = '.pf-v5-c-menu__item-main';
export const menuItem = '.pf-v5-c-menu__item';
export const startInPause = '#start-in-pause-mode';
export const hostnameEditBtn = '[data-test-id="wizard-overview-hostname-edit"]';
export const hostnameInput = 'input#hostname';
export const headlessMode = '#headless-mode';
export const workloadEditBtn = '[data-test-id="wizard-overview-workload-profile-edit"]';

// Scheduling
export const nodeSelectorEditBtn = '[data-test-id="node-selector-edit"]';
export const tolerationEditBtn = '[data-test-id="tolerations-edit"]';
export const affinityEditBtn = '[data-test-id="affinity-rules-edit"]';
export const deschedulerEditBtn = '[data-test-id="descheduler-edit"]';
export const deschedulerCheckBox = '#descheduler';
export const dedicatedResourceEditBtn = '[data-test-id="dedicated-resources-edit"]';
export const dedicatedResourceCheckBox = '#dedicated-resources';
export const evictionStrategyEditBtn = '[data-test-id="eviction-strategy-edit"]';
export const evictionStrategyCheckBox = '#eviction-strategy';
export const labelsEditBtn = '[data-test-id="wizard-metadata-labels-edit"]';
export const labelsInput = '[data-test="tags-input"]';

// Scripts
export const cloudInitEditBtn = '[data-test-id="wizard-cloudinit-edit"]';
export const cloudInitUser = '#cloudinit-user';
export const cloudInitPwd = '#cloudinit-password';
export const networkCheckbox = 'input[id="custom-network-checkbox"]';
export const ethName = 'input[id="ethernet-name"]';
export const ipAddr = 'input[id="address"]';
export const gateway = 'input[id="gateway"]';
export const sshEditBtn = '[data-test-id="wizard-sshkey-edit"]';
export const sshSection = '[data-test-id="wizard-sshkey"]';
export const useExisting = '#useExisting';
export const addNew = '#addNew';
export const none = 'input[id="none"]';
export const sshInput = '#ssh-key-modal';
export const dropSecret = 'input[id="ssh-key-modal-filename"]';
export const uploadSecret = '#ssh-key-upload-filename';
export const secretName = '#new-secret-name';
export const selProjectText = 'Select project...';
export const manageKeysText = 'Manage SSH keys';

// network
export const addBtn = '[data-test="item-create"]';
