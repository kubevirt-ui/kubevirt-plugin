import type { TFunction } from 'i18next';

import type {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { DROPDOWN_FORM_SELECTION } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { TLS_CERT_SOURCE_EXISTING } from '@kubevirt-utils/components/TLSCertificateSection';
import {
  getFieldRequiredMessage,
  isValidCronExpression,
  isValidUrl,
} from '@kubevirt-utils/utils/validation';
import * as yup from '@kubevirt-utils/yup';

import type {
  BootableVolumeWizardExistingSnapshotValues,
  BootableVolumeWizardExistingVolumeValues,
  BootableVolumeWizardImageSourceValues,
  BootableVolumeWizardRegistryValues,
  BootableVolumeWizardUploadValues,
  BootableVolumeWizardURLValues,
} from '../types';

import { getInvalidCronMessage } from './shared/messages';
import { getConditionalString, optionalString, requiredString } from './shared/utils';

const createUploadSchema = (
  required: boolean,
  t: TFunction,
): yup.ObjectSchema<BootableVolumeWizardUploadValues> =>
  yup.object({
    file: required
      ? yup.mixed<File | string>().required(getFieldRequiredMessage(t))
      : yup.mixed<File | string>().optional(),
    filename: optionalString().defined(),
  });

const createExistingVolumeSchema = (
  required: boolean,
): yup.ObjectSchema<BootableVolumeWizardExistingVolumeValues> =>
  yup.object({
    clone: yup.boolean().defined(),
    name: getConditionalString(required),
    project: getConditionalString(required),
  }) as yup.ObjectSchema<BootableVolumeWizardExistingVolumeValues>;

const createExistingSnapshotSchema = (
  required: boolean,
): yup.ObjectSchema<BootableVolumeWizardExistingSnapshotValues> =>
  yup.object({
    name: getConditionalString(required),
    project: getConditionalString(required),
  }) as yup.ObjectSchema<BootableVolumeWizardExistingSnapshotValues>;

const createRegistrySchema = (
  required: boolean,
  t: TFunction,
): yup.ObjectSchema<BootableVolumeWizardRegistryValues> =>
  yup
    .object({
      cronExpression: getConditionalString(required).test(
        'cron-expression',
        getInvalidCronMessage(t),
        (value) => !required || isValidCronExpression(value),
      ),
      image: getConditionalString(required),
      password: optionalString().defined(),
      retainRevisions: yup.number().defined().min(1),
      username: optionalString().defined(),
    })
    .test('registry-credentials', function (value) {
      if (!required) return true;

      const hasUsername = Boolean(value?.username);
      const hasPassword = Boolean(value?.password);

      if (hasUsername === hasPassword) return true;

      return this.createError({
        message: t('Username and password must both be provided.'),
        path: `${this.path}.username`,
      });
    }) as yup.ObjectSchema<BootableVolumeWizardRegistryValues>;

const createURLSchema = (
  required: boolean,
  t: TFunction,
): yup.ObjectSchema<BootableVolumeWizardURLValues> =>
  yup
    .object({
      certificate: yup.string().optional(),
      certificateSource: yup.string().optional(),
      configMapName: yup.string().optional(),
      imageUrl: getConditionalString(required).test(
        'image-url',
        t('Enter a valid URL.'),
        (value) => !required || isValidUrl(value),
      ),
      project: yup.string().optional(),
      tlsCertificateRequired: yup.boolean().defined(),
    })
    .test('tls-certificate', function (value) {
      if (!required || !value?.tlsCertificateRequired) return true;

      const certificateField =
        value.certificateSource === TLS_CERT_SOURCE_EXISTING ? 'configMapName' : 'certificate';
      const certificateValue = value[certificateField];

      if (certificateValue?.trim()) return true;

      return this.createError({
        message: getFieldRequiredMessage(t),
        path: `${this.path}.${certificateField}`,
      });
    }) as yup.ObjectSchema<BootableVolumeWizardURLValues>;

const createBaseImageSourceSchema = (
  t: TFunction,
): yup.ObjectSchema<BootableVolumeWizardImageSourceValues> =>
  yup.object({
    accessMode: yup.mixed<V1beta1StorageSpecAccessModesEnum>().optional(),
    diskSize: requiredString().defined(),
    existingSnapshot: createExistingSnapshotSchema(false).defined(),
    existingVolume: createExistingVolumeSchema(false).defined(),
    registry: createRegistrySchema(false, t).defined(),
    sourceType: yup
      .mixed<DROPDOWN_FORM_SELECTION>()
      .oneOf(Object.values(DROPDOWN_FORM_SELECTION))
      .defined(),
    storageClassName: optionalString().defined(),
    upload: createUploadSchema(false, t).defined(),
    url: createURLSchema(false, t).defined(),
    volumeMode: yup.mixed<V1beta1StorageSpecVolumeModeEnum>().optional(),
  }) as yup.ObjectSchema<BootableVolumeWizardImageSourceValues>;

export const createImageSourceSchema = (
  t: TFunction,
): yup.Lazy<BootableVolumeWizardImageSourceValues> =>
  yup.lazy((value: unknown) => {
    const sourceType = (value as BootableVolumeWizardImageSourceValues | undefined)?.sourceType;
    const baseSchema = createBaseImageSourceSchema(t);

    switch (sourceType) {
      case DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME:
        return baseSchema.shape({ upload: createUploadSchema(true, t).defined() });
      case DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC:
        return baseSchema.shape({ existingVolume: createExistingVolumeSchema(true).defined() });
      case DROPDOWN_FORM_SELECTION.USE_SNAPSHOT:
        return baseSchema.shape({
          existingSnapshot: createExistingSnapshotSchema(true).defined(),
        });
      case DROPDOWN_FORM_SELECTION.USE_REGISTRY:
        return baseSchema.shape({ registry: createRegistrySchema(true, t).defined() });
      case DROPDOWN_FORM_SELECTION.USE_HTTP:
        return baseSchema.shape({ url: createURLSchema(true, t).defined() });
      default:
        return baseSchema;
    }
  }) as yup.Lazy<BootableVolumeWizardImageSourceValues>;
