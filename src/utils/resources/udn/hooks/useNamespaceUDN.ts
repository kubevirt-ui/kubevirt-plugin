import { useMemo } from 'react';

import { parseNADConfig } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { NetworkAttachmentDefinitionKind } from '@overview/OverviewTab/inventory-card/utils/types';

import { NADRole, NADTopology, PrimaryTopologies } from '../../nad/constants';

const useNamespaceUDN = (
  namespace: string,
): [
  isNamespaceManagedByUDN: boolean,
  vmsNotSupported: boolean,
  nad?: NetworkAttachmentDefinitionKind,
] => {
  const cluster = useClusterParam();

  const [nads] = useK8sWatchData<NetworkAttachmentDefinitionKind[]>({
    cluster,
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
    namespace,
  });

  const udnNAD = useMemo(
    () =>
      nads?.find((nad) => {
        const config = parseNADConfig(nad);

        return PrimaryTopologies.includes(config?.topology) && config?.role === NADRole.primary;
      }),
    [nads],
  );

  const isNamespaceManagedByUDN = useMemo(() => !isEmpty(udnNAD), [udnNAD]);

  const vmsNotSupported = useMemo(() => {
    const config = parseNADConfig(udnNAD);
    return config?.topology === NADTopology.layer3;
  }, [udnNAD]);

  return [isNamespaceManagedByUDN, vmsNotSupported, udnNAD];
};

export default useNamespaceUDN;
