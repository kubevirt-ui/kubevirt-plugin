import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { kubevirtConsole } from './utils';

export const HEADLESS_SERVICE_LABEL = 'network.kubevirt.io/headlessService';
export const HEADLESS_SERVICE_NAME = 'headless';
export const HEADLESS_SERVICE_PORT = 5434;

export const createHeadlessService = async (createdVM: V1VirtualMachine) => {
  try {
    await kubevirtK8sCreate({
      cluster: getCluster(createdVM),
      data: {
        apiVersion: ServiceModel.apiVersion,
        kind: ServiceModel.kind,
        metadata: { name: HEADLESS_SERVICE_NAME, namespace: getNamespace(createdVM) },
        spec: {
          clusterIP: 'None',
          ports: [
            {
              name: HEADLESS_SERVICE_NAME,
              port: HEADLESS_SERVICE_PORT,
              targetPort: HEADLESS_SERVICE_PORT,
            },
          ],
          selector: { [HEADLESS_SERVICE_LABEL]: HEADLESS_SERVICE_NAME },
        },
      },
      model: ServiceModel,
    });
  } catch (e) {
    kubevirtConsole.log('Failed to create headless service', e);
  }
};
