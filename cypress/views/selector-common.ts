// selectors for general and VM tabs
// sidebar
export const virtualizationNav = '[data-test-id="virtualization-nav-item"]';
export const overviewNav = '[data-test-id="virtualization-overview-nav-item"]';
export const catalogNav = '[data-test-id="virtualization-catalog-nav-item"]';
export const vmNav = '[data-test-id="virtualmachines-nav-item"]';
export const volNav = '[data-test-id="bootablevolumes-nav-item"]';
export const templateNav = '[data-test-id="templates-nav-item"]';
export const migrationPoliciesNav = '[data-test-id="migrationpolicies-nav-item"]';
export const instanceTypesNav = '[data-test-id="virtualmachineclusterinstancetypes-nav-item"]';
export const VMCINav = '[data-test-id="virtualmachineclusterinstancetypes-nav-item"]';
export const VMCPNav = '[data-test-id="virtualmachineclusterpreferences-nav-item"]';
export const VCheckupsNav = '[data-test-id="virtualization-checkups-nav-item"]';

// general
export const formGroup = '.pf-v6-c-form__group';
export const descrGroup = '.pf-v6-c-description-list__group';
export const descrText = '.pf-v6-c-description-list__text';
export const tagsInput = 'input#tags-input';
export const labelText = '.pf-v6-c-label__text';
export const labelContent = '.pf-v6-c-label__content';
export const actionsBtn = 'button.pf-v6-c-menu-toggle.pf-m-plain';
export const submitButton = 'button[type=submit]';
export const resourceTitle = '[data-test-id="resource-title"]';
export const itemCreateBtn = '[data-test="item-create"]';
export const createBtn = '[data-test="save-changes"]';
export const modalHeader = '.pf-v6-c-modal-box__header';
export const emptyMsg = '#no-templates-msg';
export const row = '[data-test-rows="resource-row"]';
export const dropDownItem = '.pf-v6-c-dropdown__menu-item';
export const menuToggleText = '.pf-v6-c-menu-toggle__text';
export const vmStatusTop = '.vm-resource-label';
export const menuItemMain = '.pf-v6-c-menu__item-main';
export const gridItem = '.pf-v6-l-grid';
export const mastheadLogo = '[data-test="masthead-logo"]';

// VM list
export const vmStatusOnList = 'td[data-label="status"]';
export const vmNode = '#node';
export const colManage = 'button[aria-label="Column management"]';
export const resetBtn = '#reset-action';
export const resetBtnTxt = 'Restore default columns';
export const statusCol = 'input[aria-labelledby="table-column-management-item-status"]';
export const conditionsCol = 'input[aria-labelledby="table-column-management-item-conditions"]';
export const nodeCol = 'input[aria-labelledby="table-column-management-item-node"]';
export const ipCol = 'input[aria-labelledby="table-column-management-item-ip-address"]';
export const createdCol = 'input[aria-labelledby="table-column-management-item-created"]';
export const nsCol = 'input[aria-labelledby="table-column-management-item-namespace"]';
export const workloadCol = 'input[aria-labelledby="table-column-management-item-workload"]';
export const bootsourceCol = 'input[aria-labelledby="table-column-management-item-availability"]';
export const cpuCol = 'input[aria-labelledby="table-column-management-item-cpu"]';
export const statusTH = 'th[data-label="Status"]';
export const conditionsTH = 'th[data-label="Conditions"]';
export const nodeTH = 'th[data-label="Node"]';
export const ipTH = 'th[data-label="IP address"]';
export const createdTH = 'th[data-label="Created"]';
export const nsTH = 'th[data-label="Namespace"]';
export const workloadTH = 'th[data-label="Workload profile"]';
export const bootsourceTH = 'th[data-label="Boot source"]';
export const cpuTH = 'th[data-label="CPU | Memory"]';
export const vmCount = '.pf-v6-c-menu-toggle__text > b';
export const kebabBtn = '.pf-v6-c-table__td.pf-v6-c-table__action';
export const selectDropdownToggle = '[data-ouia-component-id="BulkSelect-toggle"]';
export const selectAllDropdownOption = '[data-ouia-component-id="BulkSelect-select-all"]';
export const projectActionStop = 'selected-vms-action-stop';

// VM overview tab
export const vmStatusOnOverview = '[data-test-id="virtual-machine-overview-details-status"]';
export const vmCreatedOnOverview = '[data-test-id="virtual-machine-overview-details-created"]';
export const vmOSOnOverview = '[data-test-id="virtual-machine-overview-details-os"]';
export const vmCpuMemOnOverview = '[data-test-id="virtual-machine-overview-details-cpu-memory"]';
export const vmHostnameOnOverview = '[data-test-id="virtual-machine-overview-details-host"]';
export const vmTemplateOnOverview = '[data-test-id="virtual-machine-overview-details-template"]';
export const detailsCard = '.VirtualMachinesOverviewTabDetails--details';
export const alertsCard = '.alerts-card__drawer';
export const snapshotsCard = '.VirtualMachinesOverviewTabSnapshots--main';
export const networkCard = '.VirtualMachinesOverviewTabInterfaces--main';
export const disksCard = '.VirtualMachinesOverviewTabDisks--main';
export const utilizationCard = '.VirtualMachinesOverviewTabUtilization--main';
export const hardwareCard = '.VirtualMachinesOverviewTabHardware--main';
export const vmName = '[data-test-id="virtual-machine-overview-details-name"]';
export const winDriverDisk = '[data-test-id="disk-windows-drivers-disk"]';
export const startIcon = 'button[data-test-id="vm-action-start-button"]';
export const stopIcon = 'button[data-test-id="vm-action-stop-button"]';
export const restartIcon = 'button[data-test-id="vm-action-restart-button"]';
export const pauseIcon = 'button[data-test-id="vm-action-pause-button"]';
export const unpauseIcon = 'button[data-test-id="vm-action-unpause-button"]';

// VM details tab
export const vmStatusOnDetails = (name: string) => `[data-test-id="${name}-status"]`;
export const detailsKebab = '#toggle-id-disk';
export const activeTab = '.co-m-horizontal-nav-item--active';
export const nicDefault = '[data-test-id="network-interface-default"]';
export const bootMode = (name: string) => `button[data-test-id="${name}-boot-method"]`;
export const os = '[data-test-id="virtual-machine-overview-details-os"]';
export const ip = (name: string) => `[data-test-id="${name}-ip-address"]`;
export const timezone = '[data-test-id="virtual-machine-overview-details-timezone"]';
export const vmTemplate = (name: string) => `[data-test-id="${name}-template"]`;
export const desc = (name: string) => `button[data-test-id="${name}-description"]`;
export const fillDesc = 'textarea[aria-label="description text area"]';
export const cpuMem = '[data-test-id="virtual-machine-overview-details-cpu-memory"]';
export const cpuField = '.input-cpu';
export const memField = '.input-memory';
export const cpuInput = 'input[name="cpu-input"]';
export const memInput = 'input[name="memory-input"]';
export const workload = (name: string) => `button[data-test-id="${name}-workload-profile"]`;
export const hostname = (name: string) => `button[data-test-id="${name}-hostname"]`;
export const hostnameInput = 'input[id="hostname"]';
export const label = '.pf-v6-c-label-group__list-item';
export const sshAccess = (name: string) => `[data-test-id="${name}-ssh-access"]`;
export const sshTypeSelect = '#ssh-service-select';
export const sshTypeNodeport = '#NodePort';
export const sshTypeLB = '#LoadBalancer';
export const sshCommandCopy = '[data-test="ssh-command-copy"]';
export const sshOverVirtctl = '[data-test="ssh-over-virtctl"]';
export const plusBtn = 'button[aria-label="Plus"]';
export const minusBtn = 'button[aria-label="Minus"]';
export const vmDetailNode = '.co-m-resource-icon.co-m-resource-node';
export const startInPause = 'button[data-test-id="start-pause-mode"]';
export const startInPauseCheckBtn = 'input[id="start-in-pause-mode"]';
export const headless = 'button[data-test-id="hardware-devices-headless-mode"]';
export const headlessCheckBtn = 'input[id="headless-mode"]';

// VM scheduling tab
export const descheduler = '[data-test-id="descheduler"]';
export const nodeSelector = '[data-test-id="node-selector"]';
export const deschedulerEditBtn = '[data-test-id="descheduler-edit"]';
export const deschedulerCheckBox = '#descheduler';
export const dedicatedResourceEditBtn = '[data-test-id="dedicated-resources"]';
export const dedicatedResourceCheckBox = '#dedicated-resources';
export const evictionStrategyEditBtn = '[data-test-id="eviction-strategy"]';
export const evictionStrategyCheckBox = '#eviction-strategy';

// VM console tab
export const guestLoginStr = 'Guest login credentials';

// VM scripts tab
export const vmCloudInitEdit = '[data-test-id="undefined-edit"]';
export const vmCloudInitUser = '#cloudinit-user';
export const vmCloudInitPwd = '#cloudinit-password';
export const vmSshKeyEdit = '[data-test-id="authorized-ssh-key-button-edit"]';
export const sshKeySection = '[data-test-id="authorized-ssh-key-button"]';
export const vmSshKeyInput = '#ssh-key-modal';
export const sshAvailable = '[data-test="ssh-popover"]';
export const vmSysprep = '[data-test-id="wizard-sysprep"]';
export const vmSysprepEdit = '[data-test-id="wizard-sysprep-edit"]';
export const unattendInput = '[data-test="sysprep-unattend-xml-input"]';
export const autoUnInput = '[data-test="sysprep-autounattend-xml-input"]';
export const infoItem = '.pf-v6-l-stack__item';
export const osLabel = '.os-label';

// VM Diagnostic tab
export const gridTable = 'table[role="grid"]';
export const toggleButton = '.pf-v6-c-table__toggle > button';
export const rowGroupBody = 'tbody[role="rowgroup"]';
export const expandedRow = '.pf-m-expanded';
export const statusCell = 'td#status';
export const enabledCell = 'td#enabled';
export const reasonCell = 'td#reason';
export const messageCell = 'td#message';

// VM Disks tab
export const addDisk = 'Add disk';
export const mountWinDriver = '[data-test-id="cdrom-drivers"]';

// DataSources page
export const nameDS = '#datasource-create-name';
export const urlDS = '#datasource-create-source-url';
export const cronDS = '#datasource-create-source-cron';

// MigrationPolicies page
export const delMP = 'mp-action-delete';

// YAML
export const yamlEditor = '.react-monaco-editor-container';

// Volumes page
export const addText = 'Add';
export const mainTable = '.co-m-pane__body.co-m-pane__body--no-top-margin';
