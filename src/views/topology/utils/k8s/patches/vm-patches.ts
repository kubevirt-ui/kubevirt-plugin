import { getAnnotations, getDescription } from '@kubevirt-utils/resources/shared';
import { K8sResourceKind, Patch } from '@openshift-console/dynamic-plugin-sdk';

export const getUpdateDescriptionPatches = (
  resource: K8sResourceKind,
  description: string,
): Patch[] => {
  const patches = [];
  const oldDescription = getDescription(resource);
  const annotations = getAnnotations(resource, null);

  if (description !== oldDescription) {
    if (!description && oldDescription) {
      patches.push({
        op: 'remove',
        path: '/metadata/annotations/description',
      });
    } else if (!annotations) {
      patches.push({
        op: 'add',
        path: '/metadata/annotations',
        value: {
          description,
        },
      });
    } else {
      patches.push({
        op: oldDescription ? 'replace' : 'add',
        path: '/metadata/annotations/description',
        value: description,
      });
    }
  }
  return patches;
};
