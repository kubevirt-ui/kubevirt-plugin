import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';

export const decodeSecret = (secret: IoK8sApiCoreV1Secret): string =>
  secret?.data ? atob(secret?.data?.key || Object.values(secret?.data)?.[0] || '') : '';
