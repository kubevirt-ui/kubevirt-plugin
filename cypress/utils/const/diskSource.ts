import { Disk } from '../../types/vm';

import {
  ARTIFACTORY_PATH,
  ARTIFACTORY_SERVER,
  CONTAINER_IMAGE,
  LOCAL_IMAGE,
  OS_IMAGES_NS,
  QUAY_CONTAINER_IMAGE,
  TEST_NS,
  TEST_PVC_NAME,
  URL_IMAGE,
} from './index';

export const DiskSource = {
  Blank: {
    name: 'Blank',
    selector: '[data-test-id="disk-source-select-blank"]',
  },
  clonePVC: {
    catalogSelector: '[data-test-id="pvc-clone"]',
    name: 'clonePVC',
    pvcName: TEST_PVC_NAME,
    pvcNS: TEST_NS,
    selector: '[data-test-id="disk-source-select-pvc"]',
    selectPVCName: 'Select PersistentVolumeClaim',
    selectPVCNS: 'Select Project',
  },
  cloneVolume: {
    catalogSelector: '[data-test-id="pvc-clone"]',
    name: 'cloneVolume',
    pvcName: TEST_PVC_NAME,
    pvcNS: TEST_NS,
    selector: '[data-test-id="disk-source-select-pvc"]',
    selectPVCName: 'Select PersistentVolumeClaim',
    selectPVCNS: 'Select Project',
  },
  DataSource: {
    name: 'DataSource',
    pvcName: 'rhel9',
    pvcNS: OS_IMAGES_NS,
    selector: '[data-test-id="disk-source-select-dataSource"]',
    selectPVCName: '--- Select DataSource name ---',
    selectPVCNS: '--- Select DataSource project ---',
  },
  Default: {
    name: 'Default',
  },
  EphemeralDisk: {
    input: 'input[data-test-id="disk-source-container"]',
    name: 'EphemeralDisk',
    selector: '[data-test-id="disk-source-select-containerDisk"]',
    value: CONTAINER_IMAGE,
  },
  ISO: {
    catalogInput: 'input[data-test-id="disk-boot-source-http-source-input"]', // url input on catalog
    catalogSelector: '[data-test-id="http"]', // selector on catalog
    name: 'ISO',
    value: `https://${ARTIFACTORY_SERVER}/${ARTIFACTORY_PATH}/cnv-tests/windows-images/raw_images/win11_validationos_amd64.iso`,
  },
  PVC: {
    name: 'PVC',
    pvcName: TEST_PVC_NAME,
    selector: '[data-test-id="disk-source-select-persistentVolumeClaim"]',
    selectPVCName: 'Select PersistentVolumeClaim',
    selectPVCNS: 'Select Project',
  },
  Registry: {
    catalogInput: 'input[data-test-id="disk-boot-source-container-source-input"]',
    catalogSelector: '[data-test-id="registry"]',
    input: 'input[data-test-id="disk-source-container"]',
    name: 'Registry',
    rpasswd: '[data-test-id="disk-boot-source-container-source-password"]',
    rusername: '[data-test-id="disk-boot-source-container-source-username"]',
    selector: '[data-test-id="disk-source-select-registry"]',
    value: QUAY_CONTAINER_IMAGE,
  },
  Upload: {
    input: 'input[id="simple-file-filename"]',
    name: 'Upload',
    selector: '[data-test-id="disk-source-select-upload"]',
    value: LOCAL_IMAGE,
  },
  URL: {
    catalogInput: 'input[data-test-id="disk-boot-source-http-source-input"]', // url input on catalog
    catalogSelector: '[data-test-id="http"]', // selector on catalog
    input: 'input[data-test-id="disk-source-url"]', // input url in disk modal
    name: 'URL',
    selector: '[data-test-id="disk-source-select-http"]', // selector in disk modal
    value: URL_IMAGE,
  },
  URL_WIN_WRONG: {
    catalogInput: 'input[data-test-id="disk-boot-source-http-source-input"]', // url input on catalog
    catalogSelector: '[data-test-id="http"]', // selector on catalog
    input: 'input[data-test-id="disk-source-url"]', // input url in disk modal
    name: 'URL',
    selector: '[data-test-id="disk-source-select-http"]', // selector in disk modal
    value: `https://${ARTIFACTORY_SERVER}/${ARTIFACTORY_PATH}/cnv-tests/windows-images/win_22.qcow2`,
  },
  URL_WIN12: {
    catalogInput: 'input[data-test-id="disk-boot-source-http-source-input"]', // url input on catalog
    catalogSelector: '[data-test-id="http"]', // selector on catalog
    input: 'input[data-test-id="disk-source-url"]', // input url in disk modal
    name: 'URL',
    selector: '[data-test-id="disk-source-select-http"]', // selector in disk modal
    value: `https://${ARTIFACTORY_SERVER}/${ARTIFACTORY_PATH}/cnv-tests/windows-images/win_12.qcow2`,
  },
  URL_WIN16: {
    catalogInput: 'input[data-test-id="disk-boot-source-http-source-input"]', // url input on catalog
    catalogSelector: '[data-test-id="http"]', // selector on catalog
    input: 'input[data-test-id="disk-source-url"]', // input url in disk modal
    name: 'URL',
    selector: '[data-test-id="disk-source-select-http"]', // selector in disk modal
    value: `https://${ARTIFACTORY_SERVER}/${ARTIFACTORY_PATH}/cnv-tests/windows-images/win_16.qcow2`,
  },
  URL_WIN2K19: {
    catalogInput: 'input[data-test-id="disk-boot-source-http-source-input"]', // url input on catalog
    catalogSelector: '[data-test-id="http"]', // selector on catalog
    input: 'input[data-test-id="disk-source-url"]', // input url in disk modal
    name: 'URL',
    selector: '[data-test-id="disk-source-select-http"]', // selector in disk modal
    value: `https://${ARTIFACTORY_SERVER}/${ARTIFACTORY_PATH}/cnv-tests/windows-images/win_19.qcow2`,
  },
  Volume: {
    name: 'Volume',
    pvcName: TEST_PVC_NAME,
    selector: '[data-test-id="disk-source-select-persistentVolumeClaim"]',
    selectPVCName: 'Select PersistentVolumeClaim',
    selectPVCNS: 'Select Project',
  },
};

export const CDSource = {
  ISO: {
    catalogInput: 'input[data-test-id="cd-boot-source-http-source-input"]', // url input on catalog
    catalogSelector: '[data-test-id="http"]', // selector on catalog
    name: 'ISO',
    // selector: '[data-test-id="cd-source-select-http"]', // selector in disk modal
    // input: 'input[data-test-id="cd-source-url"]', // input url in disk modal
    value: `https://${ARTIFACTORY_SERVER}/${ARTIFACTORY_PATH}/cnv-tests/windows-images/raw_images/win11_validationos_amd64.iso`,
  },
  PVC: {
    catalogSelector: '[data-test-id="pvc-clone"]',
    name: 'PVC',
    pvcName: TEST_PVC_NAME,
    pvcNS: TEST_NS,
    selectPVCName: '--- Select PVC name ---',
    // selector: '[data-test-id="disk-source-select-pvc"]',
    selectPVCNS: '--- Select PVC project ---',
  },
  Registry: {
    catalogInput: 'input[data-test-id="cd-boot-source-container-source-input"]',
    catalogSelector: '[data-test-id="container-disk"]',
    name: 'Registry',
    // selector: '[data-test-id="cd-source-select-registry"]',
    // input: 'input[data-test-id="cd-source-container"]',
    value: CONTAINER_IMAGE,
  },
  Upload: {
    // selector: '[data-test-id="disk-source-select-upload"]',
    catalogInput: 'input#cd-boot-source-uploadFile-filename',
    catalogSelector: '[data-test-id="upload"]',
    name: 'Upload',
    value: LOCAL_IMAGE,
  },
  URL: {
    catalogInput: 'input[data-test-id="cd-boot-source-http-source-input"]', // url input on catalog
    catalogSelector: '[data-test-id="http"]', // selector on catalog
    name: 'URL',
    // selector: '[data-test-id="cd-source-select-http"]', // selector in disk modal
    // input: 'input[data-test-id="cd-source-url"]', // input url in disk modal
    value: URL_IMAGE,
  },
};

export const blankDisk: Disk = {
  diskSource: DiskSource.Blank,
  diskType: 'Empty',
  name: 'disk-blank',
  size: '1',
};

export const urlDisk: Disk = {
  diskSource: DiskSource.URL,
  name: 'disk-url',
  size: '1',
};

export const registryDisk: Disk = {
  diskSource: DiskSource.Registry,
  diskType: 'Container',
  name: 'disk-registry',
};

export const ephemeralDisk: Disk = {
  diskSource: DiskSource.EphemeralDisk,
  diskType: 'Ephemeral',
  name: 'disk-ephemeral',
};

export const dataSourceDisk: Disk = {
  diskSource: DiskSource.DataSource,
  name: 'disk-datasource',
};

export const evDisk: Disk = {
  diskSource: DiskSource.PVC,
  diskType: 'Volume',
  name: 'disk-existing-volume',
};

export const cloneDisk: Disk = {
  diskSource: DiskSource.cloneVolume,
  diskType: 'Clone volume',
  name: 'disk-clone-volume',
};

export const uploadDisk: Disk = {
  diskSource: DiskSource.Upload,
  name: 'disk-upload',
};

export const shareDisk: Disk = {
  diskSource: DiskSource.Blank,
  diskType: 'Empty disk (blank)',
  name: 'sharedisk',
  shareDisk: true,
};

export const lunDisk: Disk = {
  diskSource: DiskSource.Blank,
  diskType: 'Empty disk (blank)',
  name: 'lundisk',
  scsiReservation: true,
  type: 'lun',
};

export const templateDisks: Disk[] = [
  blankDisk,
  // dataSourceDisk,
  ephemeralDisk,
  evDisk,
  // registryDisk,
  // urlDisk,
];

export const vmDisks: Disk[] = [blankDisk, ephemeralDisk, cloneDisk /*, registryDisk*/];

export const vmDisks1: Disk[] = [evDisk /*, uploadDisk, urlDisk */];
