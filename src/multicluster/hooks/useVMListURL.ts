import { useParams } from 'react-router-dom-v5-compat';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getACMVMListURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';

const useVMListURL = () => {
  const isACM = useIsACMPage();
  const { cluster } = useParams<{ cluster?: string }>();

  const searchURL = isACM
    ? getACMVMListURL(cluster)
    : getResourceUrl({
        model: VirtualMachineModel,
      });

  return searchURL;
};

export default useVMListURL;
