import { useMemo } from 'react';

import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-utils/models';
import { UserDefinedNetworkRole } from '@kubevirt-utils/resources/udn/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { NetworkAttachmentDefinitionKind } from '@overview/OverviewTab/inventory-card/utils/types';

import { LAYER3_TOPOLOGY, PrimaryTopologies } from '../constants';

const useNamespaceUDN = (
  namespace: string,
): [
  isNamespaceManagedByUDN: boolean,
  vmsNotSupported: boolean,
  nad?: NetworkAttachmentDefinitionKind,
] => {
  const [nads] = useK8sWatchResource<NetworkAttachmentDefinitionKind[]>({
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
    namespace,
  });

  const udnNAD = useMemo(
    () =>
      nads?.find((nad) => {
        const config = JSON.parse(nad?.spec?.config || '{}');

        return (
          PrimaryTopologies.includes(config.topology) &&
          config.role === UserDefinedNetworkRole.Primary.toLowerCase()
        );
      }),
    [nads],
  );

  const isNamespaceManagedByUDN = useMemo(() => !isEmpty(udnNAD), [udnNAD]);

  const vmsNotSupported = useMemo(() => {
    const config = JSON.parse(udnNAD?.spec?.config || '{}');
    return config.topology === LAYER3_TOPOLOGY;
  }, [udnNAD]);

  return [isNamespaceManagedByUDN, vmsNotSupported, udnNAD];
};

export default useNamespaceUDN;
