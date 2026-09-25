import { type TFunction } from 'i18next';
import * as yup from 'yup';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

import {
  type BootVolumeSelection,
  type InstanceTypeSelection,
  type VMWizardInstanceTypeValues,
} from '../../types';
import {
  COMPLETE_INSTANCE_TYPE_MESSAGE,
  INVALID_FIELD_MESSAGE,
  REQUIRED_FIELD_MESSAGE,
} from '../shared/messages';
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
      diskSize: yup.string().typeError(t(INVALID_FIELD_MESSAGE)).optional(),
      persistentVolumeClaimSource: yup
        .mixed<NonNullable<BootVolumeSelection['persistentVolumeClaimSource']>>()
        .nullable()
        .optional(),
      volume: yup
        .mixed<BootVolumeSelection['volume']>()
        .typeError(t(INVALID_FIELD_MESSAGE))
        .defined(t(REQUIRED_FIELD_MESSAGE)),
      volumeSnapshotSource: yup
        .mixed<NonNullable<BootVolumeSelection['volumeSnapshotSource']>>()
        .nullable()
        .optional(),
    })
    .typeError(t(INVALID_FIELD_MESSAGE));

const createRedHatInstanceTypeSchema = (
  t: TFunction,
): yup.ObjectSchema<RedHatInstanceTypeSelection> =>
  yup
    .object({
      name: yup.string().defined(t(REQUIRED_FIELD_MESSAGE)),
      series: requiredString(t),
      size: requiredString(t),
      type: yup
        .mixed<'redhat'>()
        .oneOf(['redhat'], t(INVALID_FIELD_MESSAGE))
        .defined(t(REQUIRED_FIELD_MESSAGE)),
    })
    .typeError(t(INVALID_FIELD_MESSAGE));

const createUserInstanceTypeSchema = (t: TFunction): yup.ObjectSchema<UserInstanceTypeSelection> =>
  yup
    .object({
      name: requiredString(t),
      namespace: requiredString(t),
      type: yup
        .mixed<'user'>()
        .oneOf(['user'], t(INVALID_FIELD_MESSAGE))
        .defined(t(REQUIRED_FIELD_MESSAGE)),
    })
    .typeError(t(INVALID_FIELD_MESSAGE));

const createInstanceTypeSelectionSchema = (t: TFunction): yup.Lazy<InstanceTypeSelection> =>
  yup.lazy((value: unknown) => {
    if (value && typeof value === 'object' && 'type' in value) {
      if (value.type === 'redhat') return createRedHatInstanceTypeSchema(t);
      if (value.type === 'user') return createUserInstanceTypeSchema(t);
    }

    return yup
      .mixed<InstanceTypeSelection>()
      .oneOf([], t(COMPLETE_INSTANCE_TYPE_MESSAGE))
      .defined(t(COMPLETE_INSTANCE_TYPE_MESSAGE));
  }) as yup.Lazy<InstanceTypeSelection>;

export const createInstanceTypeSchema = (
  t: TFunction,
): yup.ObjectSchema<VMWizardInstanceTypeValues> =>
  yup
    .object({
      bootVolume: yup
        .mixed<BootVolumeSelection>()
        .typeError(t(INVALID_FIELD_MESSAGE))
        .nullable()
        .defined(t(REQUIRED_FIELD_MESSAGE))
        .when('useBootSource', {
          is: true,
          then: () => createBootVolumeSchema(t).required(t(REQUIRED_FIELD_MESSAGE)),
        }),
      compute: createInstanceTypeSelectionSchema(t),
      operatingSystem: yup
        .mixed<OperatingSystemType>()
        .typeError(t(INVALID_FIELD_MESSAGE))
        .oneOf(Object.values(OperatingSystemType), t(INVALID_FIELD_MESSAGE))
        .required(t(REQUIRED_FIELD_MESSAGE)),
      preference: yup
        .mixed<PreferenceOption>()
        .typeError(t(INVALID_FIELD_MESSAGE))
        .required(t(REQUIRED_FIELD_MESSAGE)),
      useBootSource: yup
        .boolean()
        .typeError(t(INVALID_FIELD_MESSAGE))
        .defined(t(REQUIRED_FIELD_MESSAGE)),
      volumeNamespace: yup
        .string()
        .typeError(t(INVALID_FIELD_MESSAGE))
        .defined(t(REQUIRED_FIELD_MESSAGE)),
    })
    .typeError(t(INVALID_FIELD_MESSAGE));
