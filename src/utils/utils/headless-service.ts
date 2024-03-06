import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

export const HEADLESS_SERVICE_LABEL = 'app.kubernetes.io/name';
export const HEADLESS_SERVICE_NAME = 'headless';
export const HEADLESS_SERVICE_PORT = 5434;

export const createHeadlessService = (createdVM: V1VirtualMachine) => {
  try {
    k8sCreate({
      data: {
        apiVersion: ServiceModel.apiVersion,
        kind: ServiceModel.kind,
        metadata: { name: HEADLESS_SERVICE_NAME, namespace: createdVM?.metadata?.namespace },
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
  } catch {}
};
