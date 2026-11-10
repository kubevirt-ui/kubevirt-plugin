import type { TFunction } from 'i18next';

import {
  dns1123LabelErrMsg,
  DNS1123LabelMaxLength,
  getFieldRequiredMessage,
  getMaxNameLengthErrorMsg,
  isDNS1123Label,
} from '@kubevirt-utils/utils/validation';
import * as yup from '@kubevirt-utils/yup';

import type { BootableVolumeWizardProjectAndVolumeValues } from '../types';

import { requiredString } from './shared/utils';

export const volumeNameInputSchema = yup
  .string()
  .defined()
  .test(
    'volume-name-input',
    (value) =>
      Boolean(value?.trim()) && value.length <= DNS1123LabelMaxLength && isDNS1123Label(value),
  );

export const createVolumeNameSchema = (t: TFunction): yup.StringSchema<string> =>
  requiredString()
    .required(getFieldRequiredMessage(t))
    .max(DNS1123LabelMaxLength, getMaxNameLengthErrorMsg(t, DNS1123LabelMaxLength))
    .test(
      'dns-1123-volume-name',
      dns1123LabelErrMsg(t),
      (value) => !value || value.length > DNS1123LabelMaxLength || isDNS1123Label(value),
    );

export const createProjectAndVolumeSchema = (
  t: TFunction,
): yup.ObjectSchema<BootableVolumeWizardProjectAndVolumeValues> =>
  yup.object({
    description: yup.string().defined(),
    destinationProject: requiredString().defined(),
    volumeName: createVolumeNameSchema(t),
  });
