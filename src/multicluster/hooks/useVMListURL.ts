import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getACMVMListURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';

import useClusterParam from './useClusterParam';

const useVMListURL = () => {
  const isACM = useIsACMPage();
  const cluster = useClusterParam();

  const searchURL = isACM
    ? getACMVMListURL(cluster)
    : getResourceUrl({
        model: VirtualMachineModel,
      });

  return searchURL;
};

export default useVMListURL;
