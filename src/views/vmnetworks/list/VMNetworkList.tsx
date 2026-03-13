import React, { FC } from 'react';

import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

import useVMNetworks from '../hooks/useVMNetworks';

import LocalnetEmptyState from './components/LocalnetEmptyState/LocalnetEmptyState';
import useVMNetworkTableColumns from './hooks/useVMNetworkTableColumns';

type VMNetworkListProps = {
  onCreate: () => void;
};

const VMNetworkList: FC<VMNetworkListProps> = ({ onCreate }) => {
  const { t } = useKubevirtTranslation();
  const [vmNetworks, loaded, error] = useVMNetworks();
  const [data, filteredData, onFilterChange] = useListPageFilter(vmNetworks);
  const columns = useVMNetworkTableColumns();

  let body: React.ReactNode = null;
  if (isEmpty(data)) {
    body = <LocalnetEmptyState onCreate={onCreate} />;
  } else {
    body = (
      <ListPageBody>
        <ListPageFilter data={data} loaded={loaded} onFilterChange={onFilterChange} />
        <KubevirtTable<ClusterUserDefinedNetworkKind>
          ariaLabel={t('VirtualMachine networks')}
          columns={columns}
          data={filteredData}
          getRowId={(row) => getName(row) ?? ''}
          loaded={loaded}
          loadError={error}
          noFilteredDataEmptyMsg={t('No virtualmachine networks found')}
          unfilteredData={data}
        />
      </ListPageBody>
    );
  }

  return (
    <StateHandler error={error} hasData={!!data} loaded={loaded} showSkeletonLoading withBullseye>
      {body}
    </StateHandler>
  );
};

export default VMNetworkList;
