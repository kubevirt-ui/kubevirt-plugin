import {
  V1KubeVirtConfiguration,
  V1PermittedHostDevices,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { HyperConvergedModelGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useHCPermittedHostDevices = (): V1PermittedHostDevices => {
  const [hcList] = useK8sWatchResource({
    groupVersionKind: HyperConvergedModelGroupVersionKind,
    isList: true,
  });

  const { permittedHostDevices }: V1KubeVirtConfiguration = hcList?.[0]?.spec || {};

  return permittedHostDevices;
};

export default useHCPermittedHostDevices;
