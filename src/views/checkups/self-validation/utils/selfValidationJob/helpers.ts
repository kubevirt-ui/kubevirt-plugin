import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Generates a timestamp string in format YYYYMMDD-HHMMSS
 * @returns Timestamp string
 */
export const generateTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

/**
 * Adds an owner reference to a Kubernetes resource
 * Ensures dependent resources are automatically cleaned up when the owner is deleted
 * @param model - The Kubernetes model for the resource to patch
 * @param resourceName - Name of the resource to add the owner reference to
 * @param namespace - Namespace of the resource
 * @param owner - Owner resource details (apiVersion, kind, name, uid)
 */
export const addOwnerReference = async (
  model: K8sModel,
  resourceName: string,
  namespace: string,
  cluster: string,
  owner: {
    apiVersion: string;
    kind: string;
    name: string;
    uid: string;
  },
): Promise<void> => {
  try {
    await kubevirtK8sPatch({
      cluster,
      data: [
        {
          op: 'add',
          path: '/metadata/ownerReferences',
          value: [
            {
              apiVersion: owner.apiVersion,
              blockOwnerDeletion: true,
              kind: owner.kind,
              name: owner.name,
              uid: owner.uid,
            },
          ],
        },
      ],
      model,
      resource: { metadata: { name: resourceName, namespace } },
    });
  } catch (error) {
    kubevirtConsole.warn(`Failed to add owner reference to ${model.kind}:`, error);
  }
};
