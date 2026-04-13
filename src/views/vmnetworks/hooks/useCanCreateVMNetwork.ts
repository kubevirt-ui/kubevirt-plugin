import { ClusterUserDefinedNetworkModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

import usePhysicalNetworkOptions from './usePhysicalNetworkOptions';

type UseCanCreateVMNetwork = () => {
  canCreate: boolean;
  showNoPhysicalNetworkAlert: boolean;
};

const useCanCreateVMNetwork: UseCanCreateVMNetwork = () => {
  const [physicalNetworkOptions, , loaded, error] = usePhysicalNetworkOptions();
  const [canCreateRBAC] = useAccessReview({
    group: ClusterUserDefinedNetworkModel.apiGroup,
    resource: ClusterUserDefinedNetworkModel.plural,
    verb: 'create',
  });

  const canCreate = loaded && !error && canCreateRBAC && !isEmpty(physicalNetworkOptions);
  const showNoPhysicalNetworkAlert = loaded && !error && isEmpty(physicalNetworkOptions);

  return { canCreate, showNoPhysicalNetworkAlert };
};

export default useCanCreateVMNetwork;
