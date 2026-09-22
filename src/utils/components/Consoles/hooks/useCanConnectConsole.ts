import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

type ConsolePermissions = {
  canConnectSerial: boolean;
  canConnectVnc: boolean;
  loading: boolean;
};

const useCanConnectConsole = (
  name: string | undefined,
  namespace: string | undefined,
  cluster?: string,
): ConsolePermissions => {
  const commonParams = {
    cluster,
    group: 'subresources.kubevirt.io',
    name,
    namespace,
    verb: 'get' as const,
  };

  const [canConnectVnc, vncLoading] = useFleetAccessReview({
    ...commonParams,
    resource: 'virtualmachineinstances/vnc',
  });

  const [canConnectSerial, serialLoading] = useFleetAccessReview({
    ...commonParams,
    resource: 'virtualmachineinstances/console',
  });

  return {
    canConnectSerial,
    canConnectVnc,
    loading: vncLoading || serialLoading,
  };
};

export default useCanConnectConsole;
