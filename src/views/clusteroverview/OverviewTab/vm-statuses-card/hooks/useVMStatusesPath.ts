import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { VM_STATUS } from '@kubevirt-utils/resources/vm';
import { getVMListURL } from '@multicluster/urls';

import { ERROR } from '../utils/constants';

const useVMStatusesPath = (statusArray: typeof ERROR[] | VM_STATUS[]) => {
  const namespace = useNamespaceParam();

  const queryParams = new URLSearchParams(location.search);
  queryParams.set('rowFilter-status', statusArray.join(','));

  return getVMListURL(null, namespace, queryParams.toString());
};

export default useVMStatusesPath;
