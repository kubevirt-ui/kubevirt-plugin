import { type TFunction } from 'i18next';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import * as yup from '@kubevirt-utils/yup';
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

const createBootVolumeSchema = (): yup.ObjectSchema<BootVolumeSelection> =>
  yup.object({
    dataVolumeSource: yup
      .mixed<NonNullable<BootVolumeSelection['dataVolumeSource']>>()
      .nullable()
      .optional(),
    diskSize: yup.string().optional(),
    persistentVolumeClaimSource: yup
      .mixed<NonNullable<BootVolumeSelection['persistentVolumeClaimSource']>>()
      .nullable()
      .optional(),
    volume: yup.mixed<BootVolumeSelection['volume']>().defined(),
    volumeSnapshotSource: yup
      .mixed<NonNullable<BootVolumeSelection['volumeSnapshotSource']>>()
      .nullable()
      .optional(),
  });

const createRedHatInstanceTypeSchema = (): yup.ObjectSchema<RedHatInstanceTypeSelection> =>
  yup.object({
    name: yup.string().defined(),
    series: requiredString(),
    size: requiredString(),
    type: yup.mixed<'redhat'>().oneOf(['redhat']).defined(),
  });

const createUserInstanceTypeSchema = (): yup.ObjectSchema<UserInstanceTypeSelection> =>
  yup.object({
    name: requiredString(),
    namespace: requiredString(),
    type: yup.mixed<'user'>().oneOf(['user']).defined(),
  });

const createInstanceTypeSelectionSchema = (t: TFunction): yup.Lazy<InstanceTypeSelection> =>
  yup.lazy((value: unknown) => {
    if (value && typeof value === 'object' && 'type' in value) {
      if (value.type === 'redhat') return createRedHatInstanceTypeSchema();
      if (value.type === 'user') return createUserInstanceTypeSchema();
    }

    return yup
      .mixed<InstanceTypeSelection>()
      .oneOf([], getValidationMessage('COMPLETE_INSTANCE_TYPE_MESSAGE', t))
      .defined(getValidationMessage('COMPLETE_INSTANCE_TYPE_MESSAGE', t));
  }) as yup.Lazy<InstanceTypeSelection>;

export const createInstanceTypeSchema = (
  t: TFunction,
): yup.ObjectSchema<VMWizardInstanceTypeValues> =>
  yup.object({
    bootVolume: yup
      .mixed<BootVolumeSelection>()
      .nullable()
      .defined()
      .when('useBootSource', {
        is: true,
        then: () => createBootVolumeSchema().required(),
      }),
    compute: createInstanceTypeSelectionSchema(t),
    operatingSystem: yup
      .mixed<OperatingSystemType>()
      .oneOf(Object.values(OperatingSystemType))
      .required(),
    preference: yup.mixed<PreferenceOption>().required(),
    useBootSource: yup.boolean().defined(),
    volumeNamespace: yup.string().defined(),
  });
