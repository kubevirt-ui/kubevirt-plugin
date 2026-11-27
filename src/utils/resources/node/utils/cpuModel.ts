import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';

const CPU_MODEL_LABEL = 'cpu-model.node.kubevirt.io/';

/** Schedulable virt nodes missing `cpu-model.node.kubevirt.io/<model>=true`. */
export const getNodesMissingCPUModel = (
  nodes: IoK8sApiCoreV1Node[] | undefined,
  model: string | undefined,
): string[] => {
  if (!model || !nodes?.length) {
    return [];
  }

  const label = `${CPU_MODEL_LABEL}${model}`;
  return nodes
    .filter((node) => node?.metadata?.labels?.[label] !== 'true')
    .map((node) => getName(node))
    .filter(Boolean)
    .sort();
};
