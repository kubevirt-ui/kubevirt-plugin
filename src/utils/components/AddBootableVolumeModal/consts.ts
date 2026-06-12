import { DataImportCronModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/utils/constants';
import {
  TLS_CERT_SOURCE_EXISTING,
  TLSCertSourceType,
} from '@kubevirt-utils/components/TLSCertificateSection';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { CDI_BIND_REQUESTED_ANNOTATION } from '@kubevirt-utils/hooks/useCDIUpload/consts';

import { AddBootableVolumeState } from './types';

export const SOURCE_DETAILS_SECTION_ID = 'source-details-section';

export enum DROPDOWN_FORM_SELECTION {
  UPLOAD_VOLUME = 'volume',
  USE_EXISTING_PVC = 'pvc',
  USE_HTTP = 'http',
  USE_REGISTRY = 'registry',
  USE_SNAPSHOT = 'snapshot',
}

export const optionsValueLabelMapper = {
  [DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME]: 'Volume',
  [DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]: 'Volume',
  [DROPDOWN_FORM_SELECTION.USE_HTTP]: 'URL',
  [DROPDOWN_FORM_SELECTION.USE_REGISTRY]: 'Registry',
  [DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]: 'Volume snapshot',
};

export const TLS_CERT_FIELD_NAMES = {
  tlsCertConfigMapName: 'tlsCertConfigMapName',
  tlsCertificate: 'tlsCertificate',
  tlsCertificateRequired: 'tlsCertificateRequired',
  tlsCertProject: 'tlsCertProject',
  tlsCertSource: 'tlsCertSource',
} as const;

export const initialBootableVolumeState = {
  annotations: {},
  bootableVolumeName: '',
  bootableVolumeNamespace: '',
  cronExpression: '',
  isIso: false,
  labels: {},
  pvcName: '',
  pvcNamespace: '',
  registryCredentials: { password: '', username: '' },
  registryURL: '',
  retainRevisions: 3,
  size: DEFAULT_DISK_SIZE,
  snapshotName: '',
  snapshotNamespace: '',
  storageClassName: '',
  tlsCertConfigMapName: '',
  tlsCertificate: '',
  tlsCertificateRequired: false,
  tlsCertProject: '',
  tlsCertSource: TLS_CERT_SOURCE_EXISTING as TLSCertSourceType,
  uploadFilename: '',
} satisfies AddBootableVolumeState;

export const initialDataImportCron: V1beta1DataImportCron = {
  apiVersion: 'cdi.kubevirt.io/v1beta1',
  kind: DataImportCronModel.kind,
  metadata: {
    annotations: {
      [CDI_BIND_REQUESTED_ANNOTATION]: 'true',
    },
    name: '',
    namespace: '',
  },
  spec: {
    managedDataSource: '',
    schedule: '',
    template: {
      spec: {},
    },
  },
};

export const emptySourceDataVolume: V1beta1DataVolume = {
  apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
  kind: DataVolumeModel.kind,
  metadata: {
    annotations: {
      [CDI_BIND_REQUESTED_ANNOTATION]: 'true',
    },
    name: '',
    namespace: OPENSHIFT_OS_IMAGES_NS,
  },
  spec: {
    storage: {
      resources: {
        requests: {
          storage: '',
        },
      },
    },
  },
};

export const emptyDataSource: V1beta1DataSource = {
  apiVersion: `${DataSourceModel.apiGroup}/${DataSourceModel.apiVersion}`,
  kind: DataSourceModel.kind,
  metadata: {
    name: '',
    namespace: OPENSHIFT_OS_IMAGES_NS,
  },
  spec: { source: {} },
};

const BACKGROUND_IMPORT_SOURCE_TYPES = [
  DROPDOWN_FORM_SELECTION.USE_HTTP,
  DROPDOWN_FORM_SELECTION.USE_REGISTRY,
];

export const isUploadVolumeSource = (sourceType: DROPDOWN_FORM_SELECTION): boolean =>
  sourceType === DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME;

export const isBackgroundImportSource = (sourceType: DROPDOWN_FORM_SELECTION): boolean =>
  BACKGROUND_IMPORT_SOURCE_TYPES.includes(sourceType);
