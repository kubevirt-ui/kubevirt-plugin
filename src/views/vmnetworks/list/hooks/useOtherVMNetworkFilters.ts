import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ClusterUserDefinedNetworkModel,
  NetworkAttachmentDefinitionModel,
  UserDefinedNetworkModel,
} from '@kubevirt-utils/models';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { VALID_OTHER_VM_NETWORK_TYPES } from '../constants';
import { OtherVMNetworkWithType, VMNetworkType } from '../types';
import { getVMNetworkTypeLabel } from '../utils';

enum KindFilterIDs {
  CUDN = 'cudn',
  NAD = 'nad',
  UDN = 'udn',
}

const getIDFromKind = (kind: string): KindFilterIDs => {
  if (kind === ClusterUserDefinedNetworkModel.kind) return KindFilterIDs.CUDN;
  if (kind === UserDefinedNetworkModel.kind) return KindFilterIDs.UDN;
  if (kind === NetworkAttachmentDefinitionModel.kind) return KindFilterIDs.NAD;
  return undefined;
};

const useOtherVMNetworkFilters = (): RowFilter<OtherVMNetworkWithType>[] => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => [
      {
        filter: ({ selected }, obj) => {
          if (selected?.length === 0) return true;

          const id = getIDFromKind(obj.kind);
          if (id && selected.includes(id)) return true;

          return false;
        },
        filterGroupName: t('Kind'),
        items: [
          {
            id: KindFilterIDs.CUDN,
            title: t('Cluster-wide UserDefinedNetworks'),
          },
          {
            id: KindFilterIDs.UDN,
            title: t('Namespaced UserDefinedNetworks'),
          },
          {
            id: KindFilterIDs.NAD,
            title: t('NetworkAttachmentDefinitions'),
          },
        ],
        reducer: (obj) => {
          return getIDFromKind(obj.kind);
        },
        type: 'vm-network-kind',
      },
      {
        filter: ({ selected }, obj) => {
          if (selected?.length === 0) return true;
          return selected.includes(obj.type);
        },
        filterGroupName: t('Type'),
        items: Object.values(VMNetworkType)
          .filter((type) => VALID_OTHER_VM_NETWORK_TYPES.has(type))
          .map((type) => ({
            id: type,
            title: getVMNetworkTypeLabel(type, t),
          })),
        reducer: (obj) => obj.type,
        type: 'vm-network-type',
      },
    ],
    [t],
  );
};

export default useOtherVMNetworkFilters;
