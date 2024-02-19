import React, { FC, useEffect, useMemo, useState } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { columnSorting, isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageBody, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Flex, FlexItem, Pagination, Title } from '@patternfly/react-core';
import { Table, Th, Thead, Tr } from '@patternfly/react-table';

import useDiagnosticConditionsTableColumns from '../hooks/useDiagnosticConditionsTableColumns';
import useDiagnosticFilter from '../hooks/useDiagnosticFilter';
import { VirtualizationStatusCondition } from '../utils/types';
import VirtualMachineDiagnosticTabRow from '../VirtualMachineDiagnosticTabRow';

type VirtualMachineDiagnosticTabConditionsProps = {
  conditions: VirtualizationStatusCondition[];
};

const VirtualMachineDiagnosticTabConditions: FC<VirtualMachineDiagnosticTabConditionsProps> = ({
  conditions,
}) => {
  const { t } = useKubevirtTranslation();

  const [expend, setExpend] = useState<{ [key: string]: Set<string> }>({
    expended: new Set(),
    ids: new Set(),
  });

  const [columns, activeColumns, sorting, loadedColumns] = useDiagnosticConditionsTableColumns();
  const { onPaginationChange, pagination } = usePagination();
  const sortedData = useMemo(
    () => columnSorting(conditions, sorting?.direction, pagination, sorting?.column),
    [conditions, sorting, pagination],
  );
  const filters = useDiagnosticFilter();
  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(sortedData, filters);

  useEffect(
    () =>
      sortedData.forEach(({ id }) => {
        setExpend((expendObj) => {
          return { expended: new Set(), ids: new Set(expendObj?.ids).add(id) };
        });
      }),
    [sortedData],
  );

  if (!loadedColumns) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  return (
    <>
      <ListPageBody>
        <Title className="VirtualMachineDiagnosticTab--header" headingLevel="h2">
          {t('Status conditions')}{' '}
          <HelpTextIcon
            bodyContent={t(
              'Conditions provide a standard mechanism for status reporting. Conditions are reported for all aspects of a VM.',
            )}
            helpIconClassName="title-help-text-icon"
          />
        </Title>

        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <ListPageFilter
              columnLayout={{
                columns: columns?.map(({ id, title }) => ({
                  id,
                  title,
                })),
                id: 'diagnostic-tab-status',
                selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
                type: t('VirtualMachine'),
              }}
              onFilterChange={(...args) => {
                onFilterChange(...args);
                onPaginationChange({
                  endIndex: pagination?.perPage,
                  page: 1,
                  perPage: pagination?.perPage,
                  startIndex: 0,
                });
              }}
              data={unfilteredData}
              hideLabelFilter
              loaded={!isEmpty(unfilteredData) && loadedColumns}
              nameFilterPlaceholder={t('Search by reason...')}
              rowFilters={filters}
            />
          </FlexItem>
          <FlexItem>
            <Pagination
              onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                onPaginationChange({ endIndex, page, perPage, startIndex })
              }
              onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                onPaginationChange({ endIndex, page, perPage, startIndex })
              }
              isLastFullPageShown
              itemCount={filteredData?.length}
              page={pagination?.page}
              perPage={pagination?.perPage}
              perPageOptions={paginationDefaultValues}
            />
          </FlexItem>
        </Flex>
      </ListPageBody>

      <Table isExpandable>
        <Thead>
          <Tr>
            <Th
              expand={{
                areAllExpanded: expend.expended.size !== expend.ids.size,
                collapseAllAriaLabel: '',
                onToggle: (_, __, isOpen) => {
                  setExpend((expendObj) => ({
                    expended: new Set(!isOpen ? [] : expendObj.ids),
                    ids: new Set(expendObj?.ids),
                  }));
                },
              }}
            />
            {activeColumns?.map(({ cell: { sort }, title }, index) => {
              return (
                <Th key={title} sort={sort(index)}>
                  {title}
                </Th>
              );
            })}
          </Tr>
        </Thead>
        {filteredData.map((row, index) => (
          <VirtualMachineDiagnosticTabRow
            activeColumns={activeColumns}
            expend={expend}
            index={index}
            key={row?.metadata?.name}
            obj={row}
            setExpend={setExpend}
          />
        ))}
      </Table>
    </>
  );
};

export default VirtualMachineDiagnosticTabConditions;
