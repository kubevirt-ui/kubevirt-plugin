import { NetworkAttachmentDefinition } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/types';
import useConsoleFetch from '@kubevirt-utils/hooks/useConsoleFetch';

import { FORKLIFT_INVENTORY_BASE_URL } from './constants';

const useProviderNADs = (provider: string) => {
  return useConsoleFetch<NetworkAttachmentDefinition[]>(
    `${FORKLIFT_INVENTORY_BASE_URL}/providers/${provider}/networkattachmentdefinitions`,
    [],
  );
};

export default useProviderNADs;
