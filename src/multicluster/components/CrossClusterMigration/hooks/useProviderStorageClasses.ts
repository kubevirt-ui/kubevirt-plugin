import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes';
import useConsoleFetch from '@kubevirt-utils/hooks/useConsoleFetch';

import { FORKLIFT_INVENTORY_BASE_URL } from './constants';

const useProviderStorageClasses = (provider: string) => {
  return useConsoleFetch<IoK8sApiStorageV1StorageClass[]>(
    `${FORKLIFT_INVENTORY_BASE_URL}/providers/${provider}/storageclasses`,
    [],
  );
};

export default useProviderStorageClasses;
