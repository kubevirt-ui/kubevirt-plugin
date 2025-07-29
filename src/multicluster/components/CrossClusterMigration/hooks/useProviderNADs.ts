import { NetworkAttachmentDefinition } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/types';
import useConsoleFetch from '@kubevirt-utils/hooks/useConsoleFetch';

import { FORKLIFT_INVENTORY_BASE_URL } from './constants';

const useProviderNADs = (providerUID: string) => {
  return useConsoleFetch<NetworkAttachmentDefinition[]>(
    `${FORKLIFT_INVENTORY_BASE_URL}/providers/openshift/${providerUID}/networkattachmentdefinitions`,
    [],
  );
};

export default useProviderNADs;
