import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';

export const validateSecretName = (secretName: string, secrets: IoK8sApiCoreV1Secret[]) =>
  !Boolean(secrets?.find((secret) => secret?.metadata?.name === secretName));
