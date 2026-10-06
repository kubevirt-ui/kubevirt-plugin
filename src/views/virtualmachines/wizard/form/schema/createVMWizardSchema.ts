import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import * as yup from '@kubevirt-utils/yup';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';

import { type VMWizardCloneValues, type VMWizardFormValues } from '../types';

import { createCustomizationSchema } from './customization/createCustomizationSchema';
import { createDeploymentSchema } from './deployment/createDeploymentSchema';
import { createInstanceTypeSchema } from './instanceType/createInstanceTypeSchema';
import { getValidationMessage } from './shared/messages';
import { createTemplateSchema } from './template/createTemplateSchema';

type VMWizardSchemaInputs = {
  requiredLabels: readonly AutoAppliedLabel[];
};

const inactiveBranchSchema = <T extends object>(): yup.MixedSchema<T> => yup.mixed<T>().defined();

const createCloneSchema = (t: TFunction): yup.ObjectSchema<VMWizardCloneValues> =>
  yup.object({
    sourceVM: yup
      .mixed<V1VirtualMachine>()
      .required(getValidationMessage('SELECT_CLONE_SOURCE_MESSAGE', t)),
  });

export const createVMWizardSchema = (
  { requiredLabels }: VMWizardSchemaInputs,
  t: TFunction,
): yup.ObjectSchema<VMWizardFormValues> =>
  yup.object({
    clone: yup.mixed<VMWizardFormValues['clone']>().when('creationMethod', {
      is: VMCreationMethod.CLONE,
      otherwise: () => inactiveBranchSchema<VMWizardFormValues['clone']>(),
      then: () => createCloneSchema(t),
    }),
    creationMethod: yup.mixed<VMCreationMethod>().oneOf(Object.values(VMCreationMethod)).defined(),
    customization: createCustomizationSchema({ requiredLabels }, t),
    deployment: createDeploymentSchema(t),
    instanceType: yup.mixed<VMWizardFormValues['instanceType']>().when('creationMethod', {
      is: VMCreationMethod.INSTANCE_TYPE,
      otherwise: () => inactiveBranchSchema<VMWizardFormValues['instanceType']>(),
      then: () => createInstanceTypeSchema(t),
    }),
    template: yup.mixed<VMWizardFormValues['template']>().when('creationMethod', {
      is: VMCreationMethod.TEMPLATE,
      otherwise: () => inactiveBranchSchema<VMWizardFormValues['template']>(),
      then: () => createTemplateSchema(t),
    }),
  }) as yup.ObjectSchema<VMWizardFormValues>;
