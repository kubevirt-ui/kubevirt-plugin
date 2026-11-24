import { type TFunction } from 'i18next';
import isEqual from 'lodash/isEqual';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { type CloudIdentityFormValues, type CloudIdentityProvider } from '../types/types';
import { createServiceAccount } from './createServiceAccount';
import { getServiceAccountName } from './serviceAccount';
import { updatePersistedVM } from './updatePersistedVM';

type SubmitParams = {
  cluster?: string;
  createdValues?: CloudIdentityFormValues;
  namespace: string;
  onCreated?: (values: CloudIdentityFormValues) => void;
  provider: CloudIdentityProvider;
  t: TFunction;
  values: CloudIdentityFormValues;
  vm: V1VirtualMachine;
};

export const submit = async ({
  cluster,
  createdValues,
  namespace,
  onCreated,
  provider,
  t,
  values,
  vm,
}: SubmitParams): Promise<void> => {
  const isNew = values.serviceAccountSource === 'new';
  const serviceAccountName = getServiceAccountName(values);

  if (isNew && !isEqual(createdValues, values)) {
    await createServiceAccount({ cluster, namespace, provider, values });
    onCreated?.({ ...values });
  }

  try {
    await updatePersistedVM({
      cluster,
      namespace,
      provider,
      serviceAccountName,
      t,
      vm,
    });
  } catch (error) {
    if (!isNew) throw error;

    const detail = error instanceof Error ? ` ${error.message}` : '';

    throw new Error(
      t(
        'ServiceAccount {{serviceAccountName}} was created, but it could not be attached to the VirtualMachine. Try saving again to retry the attachment.{{detail}}',
        { detail, serviceAccountName },
      ),
    );
  }
};
