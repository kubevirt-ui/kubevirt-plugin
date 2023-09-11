import {
  V1KubeVirtConfiguration,
  V1PermittedHostDevices,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { HyperConvergedModelGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseHCPermittedHostDevicesType = () => {
  errorHcList: Error;
  loadedHcList: boolean;
  permittedHostDevices: V1PermittedHostDevices;
};

const useHCPermittedHostDevices: UseHCPermittedHostDevicesType = () => {
  const [hcList, loadedHcList, errorHcList] = useK8sWatchResource({
    groupVersionKind: HyperConvergedModelGroupVersionKind,
    isList: true,
  });

  const { permittedHostDevices }: V1KubeVirtConfiguration = hcList?.[0]?.spec || {};

  return { errorHcList, loadedHcList, permittedHostDevices };
};

export default useHCPermittedHostDevices;
