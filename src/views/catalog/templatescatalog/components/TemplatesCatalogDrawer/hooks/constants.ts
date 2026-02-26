import {
  TLS_CERT_SOURCE_EXISTING,
  TLSCertSourceType,
} from '@kubevirt-utils/components/TLSCertificateSection';

import { DrawerContext } from './useDrawerContext';

export type TLSCertState = {
  tlsCertConfigMapName: null | string;
  tlsCertificate: null | string;
  tlsCertificateRequired: boolean;
  tlsCertProject: null | string;
  tlsCertSource: TLSCertSourceType;
};

export const initialValue: DrawerContext = {
  bootSourceLoaded: false,
  cdFile: null,
  cdUpload: null,
  diskFile: null,
  diskUpload: null,
  isBootSourceAvailable: null,
  originalTemplate: null,
  registryCredentials: { password: '', username: '' },
  setCDFile: null,
  setDiskFile: null,
  setRegistryCredentials: null,
  setSSHDetails: null,
  setStorageClassName: null,
  setTemplate: null,
  setTLSCertState: null,
  sshDetails: null,
  storageClassName: null,
  storageClassRequired: false,
  template: null,
  templateDataLoaded: false,
  templateLoadingError: null,
  tlsCertState: {
    tlsCertConfigMapName: null,
    tlsCertificate: null,
    tlsCertificateRequired: false,
    tlsCertProject: null,
    tlsCertSource: TLS_CERT_SOURCE_EXISTING,
  },
  uploadCDData: null,
  uploadDiskData: null,
  vm: null,
};
