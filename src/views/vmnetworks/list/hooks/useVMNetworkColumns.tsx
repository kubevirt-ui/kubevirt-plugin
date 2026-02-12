import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getMTU } from '@kubevirt-utils/resources/udn/selectors';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { TableColumn, useActiveColumns } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const sortUDNByMTU =
  (direction: string) => (a: ClusterUserDefinedNetworkKind, b: ClusterUserDefinedNetworkKind) => {
    const aMTU = getMTU(a) ?? 0;
    const bMTU = getMTU(b) ?? 0;
    const result = aMTU - bMTU;
    return direction === 'asc' ? result : -result;
  };

const useVMNetworkColumns = (): { id: string; title: string }[] => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<ClusterUserDefinedNetworkKind>[] = useMemo(
    () => [
      {
        id: 'name',
        sort: 'metadata.name',
        title: t('Name'),
        transforms: [sortable],
      },
      {
        id: 'connected-projects',
        title: t('Connected projects'),
      },
      {
        id: 'physicalNetworkName',
        sort: 'spec.network.localnet.physicalNetworkName',
        title: t('Physical network name'),
        transforms: [sortable],
      },
      {
        id: 'vlanID',
        sort: 'spec.network.localnet.vlan.access.id',
        title: t('VLAN ID'),
        transforms: [sortable],
      },
      {
        id: 'mtu',
        sort: (data, direction) => data?.toSorted(sortUDNByMTU(direction)),
        title: t('MTU'),
        transforms: [sortable],
      },
      {
        id: '',
        props: { className: 'pf-v6-c-table__action' },
        title: '',
      },
    ],
    [t],
  );

  const [activeColumns] = useActiveColumns<ClusterUserDefinedNetworkKind>({
    columnManagementID: 'VMNetworkList',
    columns,
    showNamespaceOverride: false,
  });

  return activeColumns;
};

export default useVMNetworkColumns;
