import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';
import { TableComposable, Th, Thead, Tr } from '@patternfly/react-table';
import {
  paginationDefaultValues,
  paginationInitialState,
  PaginationState,
} from '@virtualmachines/utils';

import useDiagnosticColumns from './hooks/useDiagnosticColumns';
import useDiagnosticFilter from './hooks/useDiagnosticFilter';
import useDiagnosticData from './hooks/useDianosticData';
import VirtualMachineDiagnosticTabRow from './VirtualMachineDiagnosticTabRow';

import './virtual-machine-diagnostic-tab.scss';

type VirtualMachineDiagnosticTabProps = RouteComponentProps & {
  obj: V1VirtualMachine;
};

const VirtualMachineDiagnosticTab: FC<VirtualMachineDiagnosticTabProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const [pagination, setPagination] = useState<PaginationState>(paginationInitialState);
  const [expend, setExpend] = useState<{ [key: string]: Set<string> }>({
    expended: new Set(),
    ids: new Set(),
  });

  const [columns, activeColumns, sorting] = useDiagnosticColumns();
  const data = useDiagnosticData(vm, sorting, pagination);
  const filters = useDiagnosticFilter();
  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(data, filters);

  useEffect(
    () =>
      data.forEach(({ id }) => {
        setExpend((expendObj) => {
          return { ids: new Set(expendObj?.ids).add(id), expended: new Set() };
        });
      }),
    [data],
  );

  const onPageChange = ({ page, perPage, startIndex, endIndex }) => {
    setPagination(() => ({
      page,
      perPage,
      startIndex,
      endIndex,
    }));
  };

  return (
    <div className="co-m-pane__body co-m-pane__body--no-top-margin">
      <ListPageBody>
        <div className="VirtualMachineDiagnosticTab--filters__main">
          <ListPageFilter
            data={unfilteredData}
            loaded={!isEmpty(unfilteredData)}
            rowFilters={filters}
            nameFilterPlaceholder={t('Search by reason...')}
            hideLabelFilter
            onFilterChange={(...args) => {
              onFilterChange(...args);
              setPagination((prevPagination) => ({
                ...prevPagination,
                page: 1,
                startIndex: 0,
                endIndex: prevPagination?.perPage,
              }));
            }}
            columnLayout={{
              columns: columns?.map(({ id, title }) => ({
                id,
                title,
              })),
              id: 'diagnostic-tab',
              selectedColumns: new Set(activeColumns?.map((col) => col?.id)),

              type: t('VirtualMachine'),
            }}
          />
          <Pagination
            itemCount={filteredData?.length}
            page={pagination?.page}
            perPage={pagination?.perPage}
            defaultToFullPage
            onSetPage={(_e, page, perPage, startIndex, endIndex) =>
              onPageChange({ page, perPage, startIndex, endIndex })
            }
            onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
              onPageChange({ page, perPage, startIndex, endIndex })
            }
            perPageOptions={paginationDefaultValues}
          />
        </div>
      </ListPageBody>
      <TableComposable isExpandable>
        <Thead>
          <Tr>
            <Th
              expand={{
                areAllExpanded: expend.expended.size !== expend.ids.size,
                collapseAllAriaLabel: '',
                onToggle: (_, __, isOpen) => {
                  setExpend((expendObj) => ({
                    ids: new Set(expendObj?.ids),
                    expended: new Set(!isOpen ? [] : expendObj.ids),
                  }));
                },
              }}
            />
            {activeColumns?.map(({ title, cell: { sort } }, index) => {
              return (
                <Th sort={sort(index)} key={title}>
                  {title}
                </Th>
              );
            })}
          </Tr>
        </Thead>
        {filteredData.map((row, index) => (
          <VirtualMachineDiagnosticTabRow
            obj={row}
            key={row?.metadata?.name}
            index={index}
            expend={expend}
            setExpend={setExpend}
            activeColumns={activeColumns}
          />
        ))}
      </TableComposable>
    </div>
  );
};

export default VirtualMachineDiagnosticTab;
