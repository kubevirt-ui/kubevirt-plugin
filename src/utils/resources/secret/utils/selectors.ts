import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';

/**
 *  A selector for the Secret's encoded SSH key
 * @param {IoK8sApiCoreV1Secret} secret - secret
 * @return {string} key - encoded SSH key
 */
export const getSecretEncodedSSHKey = (secret: IoK8sApiCoreV1Secret) => secret?.data?.['key'];
