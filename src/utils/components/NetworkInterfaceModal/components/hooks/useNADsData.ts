import { filterUDNNads } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/utils';

import { UseNADsData } from './types';
import { useFetchNADs } from './useFetchNADs';

const useNADsData: UseNADsData = (namespace, cluster) => {
  const [nads, loaded, loadError] = useFetchNADs(namespace, cluster);

  const availableNADs = filterUDNNads(nads || []);
  return { loaded, loadError, nads: availableNADs };
};

export default useNADsData;
