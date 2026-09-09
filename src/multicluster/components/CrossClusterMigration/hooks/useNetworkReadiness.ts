import { useCallback, useEffect, useMemo } from 'react';
import { type Updater } from 'use-immer';

import {
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMapDestination,
} from '@forklift-ui/types';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { POD_NETWORK_TYPE } from '../constants';
import { getInitialNetworkMap } from '../utils';

import useProviderNADs from './useProviderNADs';

export type UseNetworkReadinessReturnType = {
  changeNetworkMap: (
    vmNetworkName: string,
    destinationNetwork: V1beta1NetworkMapSpecMapDestination,
  ) => void;
  error: Error | undefined;
  isReady: boolean;
  loaded: boolean;
  networkMap: V1beta1NetworkMap;
  targetNADs: NetworkAttachmentDefinitionKind[];
};

const useNetworkReadiness = (
  vms: V1VirtualMachine[],
  targetCluster: string,
  networkMap: V1beta1NetworkMap | null,
  setNetworkMap: Updater<V1beta1NetworkMap | null>,
): UseNetworkReadinessReturnType => {
  const namespace = vms?.[0]?.metadata?.namespace ?? '';
  const { data, error, loaded } = useProviderNADs(targetCluster, namespace);

  useEffect(() => {
    if (loaded && networkMap === null) {
      setNetworkMap(getInitialNetworkMap(vms, data));
    }
  }, [vms, loaded, networkMap, data, setNetworkMap]);

  const isReady = useMemo(
    () =>
      networkMap?.spec?.map?.every(
        (map) =>
          map.source.type === POD_NETWORK_TYPE ||
          (!isEmpty(map?.destination?.namespace) && !isEmpty(map?.destination?.name)),
      ) ?? false,
    [networkMap?.spec?.map],
  );

  const changeNetworkMap = useCallback(
    (vmNetworkName: string, destinationNetwork: V1beta1NetworkMapSpecMapDestination): void => {
      setNetworkMap((draftNetworkMap) => {
        const mappedNAD = draftNetworkMap.spec?.map?.find(
          (map) => map.source.name === vmNetworkName,
        );

        if (mappedNAD) {
          mappedNAD.destination = destinationNetwork;
        }
      });
    },
    [setNetworkMap],
  );

  return { changeNetworkMap, error, isReady, loaded, networkMap, targetNADs: data };
};

export default useNetworkReadiness;
