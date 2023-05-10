import React, { FC, useEffect, useMemo, useState } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { columnSorting, isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, Pagination, Title } from '@patternfly/react-core';
import { TableComposable, Th, Thead, Tr } from '@patternfly/react-table';

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

  const [columns, activeColumns, sorting] = useDiagnosticConditionsTableColumns();
  const { pagination, onPaginationChange } = usePagination();
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
          return { ids: new Set(expendObj?.ids).add(id), expended: new Set() };
        });
      }),
    [sortedData],
  );

  return (
    <>
      <ListPageBody>
        <Title headingLevel="h2" className="VirtualMachineDiagnosticTab--header">
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
              data={unfilteredData}
              loaded={!isEmpty(unfilteredData)}
              rowFilters={filters}
              nameFilterPlaceholder={t('Search by reason...')}
              hideLabelFilter
              onFilterChange={(...args) => {
                onFilterChange(...args);
                onPaginationChange({
                  page: 1,
                  startIndex: 0,
                  endIndex: pagination?.perPage,
                  perPage: pagination?.perPage,
                });
              }}
              columnLayout={{
                columns: columns?.map(({ id, title }) => ({
                  id,
                  title,
                })),
                id: 'diagnostic-tab-status',
                selectedColumns: new Set(activeColumns?.map((col) => col?.id)),

                type: t('VirtualMachine'),
              }}
            />
          </FlexItem>
          <FlexItem>
            <Pagination
              itemCount={filteredData?.length}
              page={pagination?.page}
              perPage={pagination?.perPage}
              defaultToFullPage
              onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                onPaginationChange({ page, perPage, startIndex, endIndex })
              }
              onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                onPaginationChange({ page, perPage, startIndex, endIndex })
              }
              perPageOptions={paginationDefaultValues}
            />
          </FlexItem>
        </Flex>
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
    </>
  );
};

export default VirtualMachineDiagnosticTabConditions;
