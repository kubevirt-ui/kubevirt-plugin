import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sGroupVersionKind, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

const PIPELINE_GROUP_VERSION_KIND: K8sGroupVersionKind = {
  group: 'tekton.dev',
  kind: 'Pipeline',
  version: 'v1',
};

/**
 * Detects whether the OpenShift Pipelines operator is installed by checking whether the
 * `tekton.dev/v1` `Pipeline` CRD is registered on the cluster.
 * @returns A tuple of `[installed, loaded]`.
 */
const useIsOpenShiftPipelinesInstalled = (): [boolean, boolean] => {
  const [pipelineModel, inFlight] = useK8sModel(PIPELINE_GROUP_VERSION_KIND);

  return [!isEmpty(pipelineModel), !inFlight];
};

export default useIsOpenShiftPipelinesInstalled;
