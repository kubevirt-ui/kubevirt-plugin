import { filterUDNNads } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/utils';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';

import { type UseNADsData } from './types';
import { useFetchNADs } from './useFetchNADs';

const isNetworkAttachmentDefinitionArray = (
  data: unknown,
): data is NetworkAttachmentDefinitionKind[] => Array.isArray(data);

const useNADsData: UseNADsData = (namespace, cluster) => {
  const fetchResult = useFetchNADs(namespace, cluster ?? '');
  const rawNads = fetchResult[0];
  const nads = isNetworkAttachmentDefinitionArray(rawNads) ? rawNads : [];
  const loaded = Boolean(fetchResult[1]);
  const loadError: unknown = fetchResult[2];

  const { primary, regular: availableNADs } = filterUDNNads(nads);
  return { loaded, loadError, nads: availableNADs, primaryNADs: primary };
};

export default useNADsData;
