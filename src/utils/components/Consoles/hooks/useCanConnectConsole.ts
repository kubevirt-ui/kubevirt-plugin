import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

const useCanConnectConsole = (
  name: string | undefined,
  namespace: string | undefined,
  cluster?: string,
): [boolean] => {
  const [canConnect] = useFleetAccessReview({
    cluster,
    group: 'subresources.kubevirt.io',
    name,
    namespace,
    resource: 'virtualmachineinstances/vnc',
    verb: 'get',
  });

  return [canConnect];
};

export default useCanConnectConsole;
