import { filterUDNNads } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/utils';

import { UseNADsData } from './types';
import { useFetchNADs } from './useFetchNADs';

const useNADsData: UseNADsData = (namespace, cluster) => {
  const [nads, loaded, loadError] = useFetchNADs(namespace, cluster);

  const { primary, regular: availableNADs } = filterUDNNads(nads || []);
  return { loaded, loadError, nads: availableNADs, primaryNADs: primary };
};

export default useNADsData;
