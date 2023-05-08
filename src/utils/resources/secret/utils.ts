import { Buffer } from 'buffer';

import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';

export const decodeSecret = (secret: IoK8sApiCoreV1Secret): string =>
  Buffer.from(secret?.data?.key || Object.values(secret?.data)?.[0] || '', 'base64').toString();

export const encodeKeyForVirtctlCommand = (decodedPubKey: string): string => {
  const sshWithCloudInitPrefix = `
#cloud-config
ssh_authorized_keys:
  - ${decodedPubKey}`;

  return Buffer.from(sshWithCloudInitPrefix).toString('base64');
};
