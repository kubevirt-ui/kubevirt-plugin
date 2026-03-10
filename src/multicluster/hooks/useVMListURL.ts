import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getACMVMListURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS } from '@virtualmachines/navigator/constants';

import useClusterParam from './useClusterParam';

const useVMListURL = () => {
  const isACM = useIsACMPage();
  const cluster = useClusterParam();

  const vmPageURL = isACM
    ? getACMVMListURL(cluster)
    : getResourceUrl({
        model: VirtualMachineModel,
      });

  return `${vmPageURL}?${VM_LIST_TAB_PARAM}=${VM_LIST_TAB_VMS}`;
};

export default useVMListURL;
