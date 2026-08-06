import { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ClusterUserDefinedNetworkModel,
  NetworkAttachmentDefinitionModel,
  UserDefinedNetworkModel,
} from '@kubevirt-utils/models';

import { VALID_OTHER_VM_NETWORK_TYPES } from '../constants';
import { OtherVMNetworkWithType, VMNetworkType } from '../types';
import { getVMNetworkTypeLabel } from '../utils';

enum KindFilterIDs {
  CUDN = 'cudn',
  NAD = 'nad',
  UDN = 'udn',
}

const getIDFromKind = (kind?: string): KindFilterIDs | undefined => {
  if (kind === ClusterUserDefinedNetworkModel.kind) return KindFilterIDs.CUDN;
  if (kind === UserDefinedNetworkModel.kind) return KindFilterIDs.UDN;
  if (kind === NetworkAttachmentDefinitionModel.kind) return KindFilterIDs.NAD;
  return undefined;
};

const useOtherVMNetworkFilters = (): KubevirtFilter<OtherVMNetworkWithType>[] => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => [
      {
        categoryLabel: t('Kind'),
        id: 'vm-network-kind',
        match: (obj, selected) => {
          const id = getIDFromKind(obj.kind);
          return Boolean(id && selected.includes(id));
        },
        options: [
          {
            label: t('Cluster-wide UserDefinedNetworks'),
            value: KindFilterIDs.CUDN,
          },
          {
            label: t('Namespaced UserDefinedNetworks'),
            value: KindFilterIDs.UDN,
          },
          {
            label: t('NetworkAttachmentDefinitions'),
            value: KindFilterIDs.NAD,
          },
        ],
      },
      {
        categoryLabel: t('Type'),
        id: 'vm-network-type',
        match: (obj, selected) => selected.includes(obj.type),
        options: Object.values(VMNetworkType)
          .filter((type) => VALID_OTHER_VM_NETWORK_TYPES.has(type))
          .map((type) => ({
            label: getVMNetworkTypeLabel(type, t),
            value: type,
          })),
      },
    ],
    [t],
  );
};

export default useOtherVMNetworkFilters;
