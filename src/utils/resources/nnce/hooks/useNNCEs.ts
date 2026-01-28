import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1NodeNetworkConfigurationEnactment } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { NodeNetworkConfigurationEnactmentModel } from '@kubevirt-utils/models';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

type UseNNCEs = () => WatchK8sResult<V1beta1NodeNetworkConfigurationEnactment[]>;

const useNNCEs: UseNNCEs = () =>
  useK8sWatchResource<V1beta1NodeNetworkConfigurationEnactment[]>({
    groupVersionKind: modelToGroupVersionKind(NodeNetworkConfigurationEnactmentModel),
    isList: true,
    namespaced: false,
  });

export default useNNCEs;
