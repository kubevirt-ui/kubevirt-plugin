import {
  type V1KubeVirtConfiguration,
  type V1PermittedHostDevices,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { getHyperconvergedConfiguration } from '@kubevirt-utils/resources/hyperconverged/selectors';

type UseHCPermittedHostDevicesReturn = {
  hcError: Error | undefined;
  hcLoaded: boolean;
  permittedHostDevices: V1PermittedHostDevices | undefined;
};

const useHCPermittedHostDevices = (): UseHCPermittedHostDevicesReturn => {
  const hcConfigResult = useKubevirtHyperconvergeConfiguration();
  const hcError = hcConfigResult.hcError instanceof Error ? hcConfigResult.hcError : undefined;

  const { permittedHostDevices }: V1KubeVirtConfiguration =
    getHyperconvergedConfiguration(hcConfigResult.hcConfig) ?? {};

  return { hcError, hcLoaded: hcConfigResult.hcLoaded, permittedHostDevices };
};

export default useHCPermittedHostDevices;
