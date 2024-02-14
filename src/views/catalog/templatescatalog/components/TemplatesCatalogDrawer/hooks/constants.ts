import { DrawerContext } from './useDrawerContext';

export const initialValue: DrawerContext = {
  bootSourceLoaded: false,
  cdFile: null,
  cdUpload: null,
  diskFile: null,
  diskUpload: null,
  isBootSourceAvailable: null,
  setCDFile: null,
  setDiskFile: null,
  setSSHDetails: null,
  setStorageClassName: null,
  setTemplate: null,
  sshDetails: null,
  storageClassName: null,
  storageClassRequired: false,
  template: null,
  templateDataLoaded: false,
  templateLoadingError: null,
  uploadCDData: null,
  uploadDiskData: null,
  vm: null,
};
