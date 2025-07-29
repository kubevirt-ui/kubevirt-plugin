import { useCallback, useEffect, useMemo } from 'react';
import { Updater } from 'use-immer';

import { V1beta1NetworkMap, V1beta1NetworkMapSpecMapDestination } from '@kubev2v/types';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NetworkAttachmentDefinition } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { POD_NETWORK_TYPE } from '../constants';
import { getInitialNetworkMap } from '../utils';

import useProviderNADs from './useProviderNADs';

export type UseNetworkReadinessReturnType = {
  changeNetworkMap: (
    vmNetworkName: string,
    destinationNetwork: V1beta1NetworkMapSpecMapDestination,
  ) => void;
  error: any;
  isReady: boolean;
  loaded: boolean;
  networkMap: V1beta1NetworkMap;
  targetNADs: NetworkAttachmentDefinition[];
};

const useNetworkReadiness = (
  vms: V1VirtualMachine[],
  targetProviderUID: string,
  networkMap: V1beta1NetworkMap,
  setNetworkMap: Updater<V1beta1NetworkMap>,
): UseNetworkReadinessReturnType => {
  const { data, error, loaded } = useProviderNADs(targetProviderUID);

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
      ),
    [networkMap?.spec?.map],
  );

  const changeNetworkMap = useCallback(
    (vmNetworkName: string, destinationNetwork: V1beta1NetworkMapSpecMapDestination) => {
      setNetworkMap((draftNetworkMap) => {
        const mappedNAD = draftNetworkMap.spec.map.find((map) => map.source.name === vmNetworkName);

        mappedNAD.destination = destinationNetwork;
      });
    },
    [setNetworkMap],
  );

  return { changeNetworkMap, error, isReady, loaded, networkMap, targetNADs: data };
};

export default useNetworkReadiness;
