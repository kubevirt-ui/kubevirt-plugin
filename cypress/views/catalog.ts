export const GRID = '#vm-catalog-grid';
export const vmCatalog = '.vm-catalog-grid-tile';
export const filterText = '#filter-text-input';
export const checkbox = '[type="checkbox"]';

// filter by OS Name
export const RHEL = '[data-test-id="osName-RHEL"]';
export const FEDORA = '[data-test-id="osName-Fedora"]';
export const CENTOS = '[data-test-id="osName-CentOS"]';
export const WINDOWS = '[data-test-id="osName-Windows"]';

// filter by workload
export const DESKTOP = '[data-test-id="workload-Desktop"]';
export const SERVER = '[data-test-id="workload-Server"]';

// template info
export const customizeVMBtn = '[data-test-id="customize-vm-btn"]';

// review and create
export const vmName = '#vm-customize-NAME';
export const diskSourceSelect = '#SelectSource';
export const diskSourceRegistry = '[data-test-id="registry"]';
export const diskSourceRegistryInput = '#container-image-registry';
export const diskSourceURL = 'input[aria-label="Image URL"]';
export const customizeVMSubmitBtn = '[data-test-id="customize-vm-submit-button"]';

// create vm
export const startOnCreation = '#start-after-create-checkbox';
export const createBtnText = 'Create VirtualMachine';
export const createWithNoBS = 'Create with no available boot source';
