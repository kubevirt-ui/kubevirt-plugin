import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';

export const decodeSecret = (secret: IoK8sApiCoreV1Secret): string =>
  secret?.data ? atob(secret?.data?.key || Object.values(secret?.data)?.[0] || '') : '';

export const validateSecretName = (secretName: string, secrets: IoK8sApiCoreV1Secret[]) =>
  !Boolean(secrets?.find((secret) => secret?.metadata?.name === secretName));
