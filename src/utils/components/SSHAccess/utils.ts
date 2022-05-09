import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ServiceSpecTypeEnum } from '@kubevirt-ui/kubevirt-api/kubernetes';

import { PORT, SSH_PORT } from './constants';

export const getSSHServiceFromVM = (
  name: string,
  namespace: string,
  labels: { [key: string]: string },
) => ({
  kind: ServiceModel.kind,
  apiVersion: ServiceModel.apiVersion,
  metadata: {
    name: `${name}-ssh-service`,
    namespace: namespace,
  },
  spec: {
    ports: [
      {
        port: PORT,
        targetPort: SSH_PORT,
      },
    ],
    type: IoK8sApiCoreV1ServiceSpecTypeEnum.NodePort,
    selector: {
      ...Object.fromEntries(
        Object.entries(labels).filter(
          ([objectKey]) => !objectKey.startsWith('vm') && !objectKey.startsWith('app'),
        ),
      ),
      'kubevirt.io/domain': name,
      'vm.kubevirt.io/name': name,
    },
  },
});
