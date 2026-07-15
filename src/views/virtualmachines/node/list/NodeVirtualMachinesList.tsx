import React, { type FC, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { getCluster } from '@multicluster/helpers/selectors';
import {
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import ColumnManagement from '@kubevirt-utils/components/ColumnManagementModal/ColumnManagement';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import { KUBEVIRT_APISERVER_PROXY } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { getVMINodeName } from '@kubevirt-utils/resources/vmi';
import { DocumentTitle, ListPageBody, type NodeKind } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, Pagination } from '@patternfly/react-core';

import ManageVirtualMachinesButton from '../../list/components/ManageVirtualMachinesButton/ManageVirtualMachinesButton';
import VirtualMachinesListPageHeader from '../../list/components/VirtualMachinesListPageHeader';
import useVirtualMachineListColumnUtils from '../../list/hooks/useVirtualMachineListColumnUtils';
import useVirtualMachineListColumns from '../../list/hooks/useVirtualMachinesListColumns';
import useVMMetrics from '../../list/hooks/useVMMetrics';
import { VM_FILTER_OPTIONS } from '../../list/utils/constants';
import { getVMRowId, VM_COLUMN_KEYS, type VMCallbacks } from '../../list/virtualMachinesDefinition';
import { useAccessibleResources } from '../../search/hooks/useAccessibleResources';
import { getVMIFromMapper } from '../../utils/mappers';
import NodeVirtualMachineEmptyState from '../NodeVirtualMachineEmptyState/NodeVirtualMachineEmptyState';

import '@kubevirt-utils/styles/list-managment-group.scss';
import '../../list/VirtualMachinesList.scss';

type NodeVirtualMachinesListProps = {
  obj: NodeKind;
};

const NODE_VM_COLUMN_MANAGEMENT_ID = `node-${VirtualMachineModelRef}`;

const NodeVirtualMachinesList: FC<NodeVirtualMachinesListProps> = ({ obj }) => {
  const { cluster, ns: namespace } = useParams<{ cluster?: string; ns: string }>();
  const { t } = useKubevirtTranslation();
  const nodeName = getName(obj);
  const { loading: loadingFeatureProxy } = useFeatures(KUBEVIRT_APISERVER_PROXY);
  useVMMetrics();

  const accessibleVMsResults = useAccessibleResources<V1VirtualMachine>({
    filterOptions: VM_FILTER_OPTIONS,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
  });
  const { loaded: vmsLoaded, resources: vmsToShow } = accessibleVMsResults;
  const vmsLoadError = accessibleVMsResults.loadError as Error | string;

  const {
    callbacks,
    loaded: utilsLoaded,
    vmiMapper,
  } = useVirtualMachineListColumnUtils(cluster, namespace);

  const filteredVMs = useMemo(() => {
    if (isEmpty(vmsToShow)) {
      return [];
    }
    return vmsToShow.filter(
      (virtualMachine) =>
        getVMINodeName(getVMIFromMapper(vmiMapper, virtualMachine)) === nodeName &&
        getCluster(virtualMachine) === cluster,
    );
  }, [vmsToShow, cluster, nodeName, vmiMapper]);

  const [pagination, setPagination] = useState(paginationInitialState);

  const onSetPagination = useCallback(
    (
      _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
      perPage: number,
      page: number,
      startIndex?: number,
      endIndex?: number,
    ) => {
      setPagination({ endIndex, page, perPage, startIndex });
    },
    [setPagination],
  );

  const { activeColumnKeys, columnLayout, columns, loadedColumns } = useVirtualMachineListColumns(
    NODE_VM_COLUMN_MANAGEMENT_ID,
    namespace,
    false,
    true,
    true,
  );
  const loaded = vmsLoaded && utilsLoaded && !loadingFeatureProxy && loadedColumns;

  return (
    <div className="node-virtual-machines-list-view">
      <VirtualMachinesListPageHeader hideFavoriteButton>
        <ManageVirtualMachinesButton />
      </VirtualMachinesListPageHeader>
      <DocumentTitle>{PageTitles.VirtualMachines}</DocumentTitle>
      <ListPageBody>
        <div className="vm-listpagebody">
          {isEmpty(filteredVMs) && loaded && !vmsLoadError ? (
            <NodeVirtualMachineEmptyState nodeName={nodeName} />
          ) : (
            <>
              <div className="list-managment-group">
                <Flex
                  className="list-managment-group__flex pf-v6-u-w-100"
                  justifyContent={{ default: 'justifyContentFlexEnd' }}
                >
                  <FlexItem>
                    <ColumnManagement columnLayout={columnLayout} />
                  </FlexItem>
                  <FlexItem>
                    <Pagination
                      className="list-managment-group__pagination"
                      isCompact
                      isLastFullPageShown
                      itemCount={filteredVMs?.length}
                      onPerPageSelect={onSetPagination}
                      onSetPage={onSetPagination}
                      page={pagination?.page}
                      perPage={pagination?.perPage}
                      perPageOptions={paginationDefaultValues}
                    />
                  </FlexItem>
                </Flex>
              </div>
              <KubevirtTable<V1VirtualMachine, VMCallbacks>
                activeColumnKeys={activeColumnKeys}
                ariaLabel={t('VirtualMachines table')}
                callbacks={callbacks}
                columns={columns}
                data={filteredVMs ?? []}
                getRowId={getVMRowId}
                initialSortKey={VM_COLUMN_KEYS.name}
                loaded={loaded}
                loadError={vmsLoadError}
                pagination={pagination}
              />
            </>
          )}
        </div>
      </ListPageBody>
    </div>
  );
};

export default NodeVirtualMachinesList;
