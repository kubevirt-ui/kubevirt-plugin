import { type TFunction } from 'i18next';

import {
  type V1beta1VirtualMachineSnapshot,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { createVMNameSchema } from '@kubevirt-utils/utils/createVMNameSchema';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { truncateToK8sName } from '@kubevirt-utils/utils/utils';
import * as yup from '@kubevirt-utils/yup';

import { type CloneVMModalFormValues } from '../types/types';

export const getDefaultValues = (
  source: V1beta1VirtualMachineSnapshot | V1VirtualMachine,
): CloneVMModalFormValues => {
  const name = getName(source);
  return {
    description: '',
    name: truncateToK8sName(isVM(source) ? `${name}-clone` : name),
    startCloneVM: false,
  };
};

export const getDescriptionPlaceholder = (
  source: V1beta1VirtualMachineSnapshot | V1VirtualMachine,
  t: TFunction,
): string => {
  const name = getName(source);
  return isVM(source)
    ? t('This is a cloned vm of {{name}}', { name })
    : t('This is a vm created from snapshot {{name}}', { name });
};

export const getCloneVMSchema = (t: TFunction): yup.ObjectSchema<CloneVMModalFormValues> => {
  return yup.object({
    description: yup.string().defined(),
    name: createVMNameSchema(t),
    startCloneVM: yup.boolean().defined(),
  });
};
