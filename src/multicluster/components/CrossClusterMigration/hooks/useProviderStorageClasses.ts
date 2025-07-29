import useConsoleFetch from '@kubevirt-utils/hooks/useConsoleFetch';

import { FORKLIFT_INVENTORY_BASE_URL } from './constants';

export type ProviderStorageClass = {
  id: string;
  name: string;
  selfLink: string;
  uid: string;
  version: string;
};

const useProviderStorageClasses = (providerUID: string) => {
  return useConsoleFetch<ProviderStorageClass[]>(
    `${FORKLIFT_INVENTORY_BASE_URL}/providers/openshift/${providerUID}/storageclasses`,
    [],
  );
};

export default useProviderStorageClasses;
