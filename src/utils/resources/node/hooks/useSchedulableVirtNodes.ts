import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import type { WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

// Label set by virt-handler on every node that can host VirtualMachineInstances.
// KubeVirt injects `kubevirt.io/schedulable: "true"` as a nodeSelector into every
// virt-launcher (and live-migration target) pod, so this is the backend's own gate
// for "can a VM run/migrate here" — unlike the node-role worker label, which KubeVirt
// never consults and which excludes legitimate custom-role/infra VM hosts.
export const KUBEVIRT_SCHEDULABLE_LABEL = 'kubevirt.io/schedulable';

type UseSchedulableVirtNodes = (cluster?: string) => WatchK8sResult<IoK8sApiCoreV1Node[]>;

const useSchedulableVirtNodes: UseSchedulableVirtNodes = (cluster) =>
  useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
    selector: {
      matchLabels: { [KUBEVIRT_SCHEDULABLE_LABEL]: 'true' },
    },
  });

export default useSchedulableVirtNodes;
