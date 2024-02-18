import {
  V1KubeVirtConfiguration,
  V1PermittedHostDevices,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration.ts';

type UseHCPermittedHostDevicesType = () => {
  hcError: Error;
  hcLoaded: boolean;
  permittedHostDevices: V1PermittedHostDevices;
};

const useHCPermittedHostDevices: UseHCPermittedHostDevicesType = () => {
  const [hcConfig, hcLoaded, hcError] = useKubevirtHyperconvergeConfiguration();

  const { permittedHostDevices }: V1KubeVirtConfiguration = hcConfig?.spec?.configuration || {};

  return { hcError, hcLoaded, permittedHostDevices };
};

export default useHCPermittedHostDevices;
