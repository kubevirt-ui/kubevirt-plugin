import { type IoK8sApiCoreV1ServiceAccount } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';

import { type CloudIdentityFormValues, type CloudIdentityProvider } from '../types/types';
import { annotationProviderMap } from './annotationProviderMap';

export const isServiceAccountCompatibleWithProvider = (
  serviceAccount: IoK8sApiCoreV1ServiceAccount,
  provider: CloudIdentityProvider,
): boolean =>
  Boolean(
    getAnnotation(serviceAccount, annotationProviderMap[provider].identityAnnotation)?.trim(),
  );

export const getCompatibleServiceAccounts = (
  serviceAccounts: IoK8sApiCoreV1ServiceAccount[],
  provider: CloudIdentityProvider,
): IoK8sApiCoreV1ServiceAccount[] =>
  serviceAccounts
    .filter((serviceAccount) => isServiceAccountCompatibleWithProvider(serviceAccount, provider))
    .sort((left, right) => (getName(left) ?? '').localeCompare(getName(right) ?? ''));

export const getServiceAccountName = (values: CloudIdentityFormValues): string =>
  values.serviceAccountSource === 'new'
    ? values.newServiceAccountName
    : values.existingServiceAccountName;

type BuildServiceAccountParams = {
  namespace: string;
  provider: CloudIdentityProvider;
  values: CloudIdentityFormValues;
};

export const buildServiceAccount = ({
  namespace,
  provider,
  values,
}: BuildServiceAccountParams): IoK8sApiCoreV1ServiceAccount => {
  const annotations = annotationProviderMap[provider].buildAnnotations(values);

  return {
    apiVersion: 'v1',
    kind: 'ServiceAccount',
    metadata: {
      annotations,
      name: getServiceAccountName(values),
      namespace,
    },
  };
};
