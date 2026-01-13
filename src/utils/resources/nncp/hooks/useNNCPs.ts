import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { NodeNetworkConfigurationPolicyModel } from '@kubevirt-utils/models';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

type UseNNCPs = () => WatchK8sResult<V1NodeNetworkConfigurationPolicy[]>;

const useNNCPs: UseNNCPs = () =>
  useK8sWatchResource<V1NodeNetworkConfigurationPolicy[]>({
    groupVersionKind: modelToGroupVersionKind(NodeNetworkConfigurationPolicyModel),
    isList: true,
    namespaced: false,
  });

export default useNNCPs;
