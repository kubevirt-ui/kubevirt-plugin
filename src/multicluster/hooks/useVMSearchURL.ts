import { VirtualMachineModel } from '@kubevirt-ui/kubevirt-api/console';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getACMVMSearchURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';

const useVMSearchURL = () => {
  const isACM = useIsACMPage();

  const searchURL = isACM
    ? getACMVMSearchURL()
    : `${getResourceUrl({
        model: VirtualMachineModel,
      })}/search`;

  return searchURL;
};

export default useVMSearchURL;
