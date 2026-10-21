import { DROPDOWN_FORM_SELECTION } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/utils/constants';
import { TLS_CERT_SOURCE_EXISTING } from '@kubevirt-utils/components/TLSCertificateSection';

import type {
  BootableVolumeWizardDefaultValuesArgs,
  BootableVolumeWizardFormValues,
  BootableVolumeWizardImageSourceValues,
  BootableVolumeWizardOperatingSystemValues,
  BootableVolumeWizardProjectAndVolumeValues,
} from './types';

export const createProjectAndVolumeDefaultValues = (
  namespace = '',
): BootableVolumeWizardProjectAndVolumeValues => ({
  description: '',
  destinationProject: namespace,
  volumeName: '',
});

export const createImageSourceDefaultValues = (): BootableVolumeWizardImageSourceValues => ({
  accessMode: undefined,
  diskSize: DEFAULT_DISK_SIZE,
  existingSnapshot: { name: '', project: '' },
  existingVolume: { clone: true, name: '', project: '' },
  registry: {
    cronExpression: '',
    image: '',
    password: '',
    retainRevisions: 3,
    username: '',
  },
  sourceType: DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME,
  storageClassName: '',
  upload: { filename: '' },
  url: {
    certificateSource: TLS_CERT_SOURCE_EXISTING,
    imageUrl: '',
    tlsCertificateRequired: false,
  },
  volumeMode: undefined,
});

export const createOperatingSystemDefaultValues = (
  lockedPreference?: BootableVolumeWizardDefaultValuesArgs['lockedPreference'],
): BootableVolumeWizardOperatingSystemValues => ({
  architecture: lockedPreference?.architecture ?? '',
  defaultInstanceType: undefined,
  operatingSystem: '',
  preference: lockedPreference ?? null,
  preferenceKind: lockedPreference?.kind,
});

export const createBootableVolumeWizardDefaultValues = ({
  lockedPreference,
  namespace = '',
}: BootableVolumeWizardDefaultValuesArgs = {}): BootableVolumeWizardFormValues => ({
  imageSource: createImageSourceDefaultValues(),
  operatingSystem: createOperatingSystemDefaultValues(lockedPreference),
  projectAndVolume: createProjectAndVolumeDefaultValues(namespace),
});
