import { NamespaceModel, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Returns the appropriate model for project/namespace operations based on cluster capabilities.
 * On OpenShift, returns ProjectModel. On vanilla Kubernetes, returns NamespaceModel.
 */
export const useProjectOrNamespaceModel = () => {
  const isOpenShift = useFlag('OPENSHIFT');
  return isOpenShift ? ProjectModel : NamespaceModel;
};
