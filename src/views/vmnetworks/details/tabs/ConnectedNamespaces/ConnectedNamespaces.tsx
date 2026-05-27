import React, { FC, useMemo } from 'react';

import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import ListSkeleton from '@kubevirt-utils/components/StateHandler/ListSkeleton';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';

import { NamespaceWithVMCount } from '../../types';

import useNamespacesWithVMCounts from './hooks/useNamespacesWithVMCounts';
import {
  getConnectedNamespaceRowId,
  getConnectedNamespacesColumns,
} from './connectedNamespacesDefinition';
import { CONNECTED_NAMESPACES_COLUMN_KEYS } from './constants';

type ConnectedNamespacesProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const ConnectedNamespaces: FC<ConnectedNamespacesProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  const [namespacesWithVMCounts, loaded, error] = useNamespacesWithVMCounts(obj);

  const columns = useMemo(() => getConnectedNamespacesColumns(t), [t]);

  if (!loaded) {
    return (
      <ListPageBody>
        <ListSkeleton />
      </ListPageBody>
    );
  }

  return (
    <ListPageBody>
      <KubevirtTable<NamespaceWithVMCount>
        ariaLabel={t('Connected namespaces table')}
        columns={columns}
        data={namespacesWithVMCounts}
        dataTest="connected-namespaces-table"
        fixedLayout
        getRowId={getConnectedNamespaceRowId}
        initialSortKey={CONNECTED_NAMESPACES_COLUMN_KEYS.name}
        loaded={loaded}
        loadError={error}
        noDataMsg={t('No connected namespaces found')}
        unfilteredData={namespacesWithVMCounts}
      />
    </ListPageBody>
  );
};

export default ConnectedNamespaces;
