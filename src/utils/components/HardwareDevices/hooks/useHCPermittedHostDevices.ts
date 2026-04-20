import {
  V1KubeVirtConfiguration,
  V1PermittedHostDevices,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useKubevirtHyperconvergeConfiguration, {
  selectHyperconvergedConfiguration,
} from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';

type UseHCPermittedHostDevicesType = () => {
  hcError: Error;
  hcLoaded: boolean;
  permittedHostDevices: V1PermittedHostDevices;
};

const useHCPermittedHostDevices: UseHCPermittedHostDevicesType = () => {
  const { hcConfig, hcError, hcLoaded } = useKubevirtHyperconvergeConfiguration();

  const { permittedHostDevices }: V1KubeVirtConfiguration =
    selectHyperconvergedConfiguration(hcConfig) || {};

  return { hcError, hcLoaded, permittedHostDevices };
};

export default useHCPermittedHostDevices;
