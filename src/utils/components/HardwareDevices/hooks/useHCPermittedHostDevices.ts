import { type V1PermittedHostDevices } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { getHyperconvergedConfiguration } from '@kubevirt-utils/resources/hyperconverged/selectors';

type UseHCPermittedHostDevicesReturn = {
  hcError: Error | undefined;
  hcLoaded: boolean;
  permittedHostDevices: V1PermittedHostDevices | undefined;
};

const useHCPermittedHostDevices = (): UseHCPermittedHostDevicesReturn => {
  const configurationResult = useKubevirtHyperconvergeConfiguration();
  const permittedHostDevices = getHyperconvergedConfiguration(
    configurationResult.hcConfig,
  )?.permittedHostDevices;

  return {
    hcError: configurationResult.hcError as Error | undefined,
    hcLoaded: configurationResult.hcLoaded,
    permittedHostDevices,
  };
};

export default useHCPermittedHostDevices;
