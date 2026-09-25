import { type TFunction } from 'i18next';
import * as yup from 'yup';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

import {
  type BootVolumeSelection,
  type InstanceTypeSelection,
  type VMWizardInstanceTypeValues,
} from '../../types';
import { getValidationMessage } from '../shared/messages';
import { requiredString } from '../shared/utils';

type RedHatInstanceTypeSelection = Extract<InstanceTypeSelection, { type: 'redhat' }>;
type UserInstanceTypeSelection = Extract<InstanceTypeSelection, { type: 'user' }>;

const createBootVolumeSchema = (t: TFunction): yup.ObjectSchema<BootVolumeSelection> =>
  yup
    .object({
      dataVolumeSource: yup
        .mixed<NonNullable<BootVolumeSelection['dataVolumeSource']>>()
        .nullable()
        .optional(),
      diskSize: yup.string().typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t)).optional(),
      persistentVolumeClaimSource: yup
        .mixed<NonNullable<BootVolumeSelection['persistentVolumeClaimSource']>>()
        .nullable()
        .optional(),
      volume: yup
        .mixed<BootVolumeSelection['volume']>()
        .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
      volumeSnapshotSource: yup
        .mixed<NonNullable<BootVolumeSelection['volumeSnapshotSource']>>()
        .nullable()
        .optional(),
    })
    .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t));

const createRedHatInstanceTypeSchema = (
  t: TFunction,
): yup.ObjectSchema<RedHatInstanceTypeSelection> =>
  yup
    .object({
      name: yup.string().defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
      series: requiredString(t),
      size: requiredString(t),
      type: yup
        .mixed<'redhat'>()
        .oneOf(['redhat'], getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
    })
    .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t));

const createUserInstanceTypeSchema = (t: TFunction): yup.ObjectSchema<UserInstanceTypeSelection> =>
  yup
    .object({
      name: requiredString(t),
      namespace: requiredString(t),
      type: yup
        .mixed<'user'>()
        .oneOf(['user'], getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
    })
    .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t));

const createInstanceTypeSelectionSchema = (t: TFunction): yup.Lazy<InstanceTypeSelection> =>
  yup.lazy((value: unknown) => {
    if (value && typeof value === 'object' && 'type' in value) {
      if (value.type === 'redhat') return createRedHatInstanceTypeSchema(t);
      if (value.type === 'user') return createUserInstanceTypeSchema(t);
    }

    return yup
      .mixed<InstanceTypeSelection>()
      .oneOf([], getValidationMessage('COMPLETE_INSTANCE_TYPE_MESSAGE', t))
      .defined(getValidationMessage('COMPLETE_INSTANCE_TYPE_MESSAGE', t));
  }) as yup.Lazy<InstanceTypeSelection>;

export const createInstanceTypeSchema = (
  t: TFunction,
): yup.ObjectSchema<VMWizardInstanceTypeValues> =>
  yup
    .object({
      bootVolume: yup
        .mixed<BootVolumeSelection>()
        .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .nullable()
        .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t))
        .when('useBootSource', {
          is: true,
          then: () =>
            createBootVolumeSchema(t).required(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
        }),
      compute: createInstanceTypeSelectionSchema(t),
      operatingSystem: yup
        .mixed<OperatingSystemType>()
        .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .oneOf(Object.values(OperatingSystemType), getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .required(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
      preference: yup
        .mixed<PreferenceOption>()
        .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .required(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
      useBootSource: yup
        .boolean()
        .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
      volumeNamespace: yup
        .string()
        .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
    })
    .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t));
