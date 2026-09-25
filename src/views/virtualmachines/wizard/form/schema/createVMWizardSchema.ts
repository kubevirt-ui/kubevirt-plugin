import { type TFunction } from 'i18next';
import * as yup from 'yup';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';

import { type VMWizardCloneValues, type VMWizardFormValues } from '../types';

import { createCustomizationSchema } from './customization/createCustomizationSchema';
import { createDeploymentSchema } from './deployment/createDeploymentSchema';
import { createInstanceTypeSchema } from './instanceType/createInstanceTypeSchema';
import {
  INVALID_FIELD_MESSAGE,
  REQUIRED_FIELD_MESSAGE,
  SELECT_CLONE_SOURCE_MESSAGE,
} from './shared/messages';
import { createTemplateSchema } from './template/createTemplateSchema';

type VMWizardSchemaInputs = {
  requiredLabels: readonly AutoAppliedLabel[];
};

const inactiveBranchSchema = <T extends object>(t: TFunction): yup.MixedSchema<T> =>
  yup.mixed<T>().typeError(t(INVALID_FIELD_MESSAGE)).defined(t(REQUIRED_FIELD_MESSAGE));

const createCloneSchema = (t: TFunction): yup.ObjectSchema<VMWizardCloneValues> =>
  yup
    .object({
      sourceVM: yup
        .mixed<V1VirtualMachine>()
        .typeError(t(INVALID_FIELD_MESSAGE))
        .required(t(SELECT_CLONE_SOURCE_MESSAGE)),
    })
    .typeError(t(INVALID_FIELD_MESSAGE));

export const createVMWizardSchema = (
  { requiredLabels }: VMWizardSchemaInputs,
  t: TFunction,
): yup.ObjectSchema<VMWizardFormValues> =>
  yup
    .object({
      clone: yup.mixed<VMWizardFormValues['clone']>().when('creationMethod', {
        is: VMCreationMethod.CLONE,
        otherwise: () => inactiveBranchSchema<VMWizardFormValues['clone']>(t),
        then: () => createCloneSchema(t),
      }),
      creationMethod: yup
        .mixed<VMCreationMethod>()
        .typeError(t(INVALID_FIELD_MESSAGE))
        .oneOf(Object.values(VMCreationMethod), t(INVALID_FIELD_MESSAGE))
        .defined(t(REQUIRED_FIELD_MESSAGE)),
      customization: createCustomizationSchema({ requiredLabels }, t),
      deployment: createDeploymentSchema(t),
      instanceType: yup.mixed<VMWizardFormValues['instanceType']>().when('creationMethod', {
        is: VMCreationMethod.INSTANCE_TYPE,
        otherwise: () => inactiveBranchSchema<VMWizardFormValues['instanceType']>(t),
        then: () => createInstanceTypeSchema(t),
      }),
      template: yup.mixed<VMWizardFormValues['template']>().when('creationMethod', {
        is: VMCreationMethod.TEMPLATE,
        otherwise: () => inactiveBranchSchema<VMWizardFormValues['template']>(t),
        then: () => createTemplateSchema(t),
      }),
    })
    .typeError(t(INVALID_FIELD_MESSAGE)) as yup.ObjectSchema<VMWizardFormValues>;
