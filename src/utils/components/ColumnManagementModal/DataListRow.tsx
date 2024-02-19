import React, { FC, FormEvent } from 'react';

import { ManagedColumn } from '@openshift-console/dynamic-plugin-sdk';
import {
  DataListCell,
  DataListCheck,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';

import { NAME_COLUMN_ID } from './constants';

type DataListRowProps = {
  checkedColumns: Set<string>;
  column: ManagedColumn;
  disableUncheckedRow: boolean;
  inputId: string;
  onChange: (event: FormEvent<HTMLInputElement>, checked: boolean) => void;
};

const DataListRow: FC<DataListRowProps> = ({
  checkedColumns,
  column,
  disableUncheckedRow,
  inputId,
  onChange,
}) => (
  <DataListItem
    aria-labelledby={`table-column-management-item-${column.id}`}
    className="data-list-row-item pf-c-data-list__item--transparent-bg"
    key={column.id}
  >
    <DataListItemRow>
      <DataListCheck
        isDisabled={
          (disableUncheckedRow && !checkedColumns.has(column.id)) || column.id === NAME_COLUMN_ID
        }
        aria-labelledby={`table-column-management-item-${column.id}`}
        checked={checkedColumns.has(column.id)}
        id={inputId}
        name={column.title}
        onChange={onChange}
      />
      <DataListItemCells
        dataListCells={[
          <DataListCell id={`table-column-management-item-${column.id}`} key={column.id}>
            <label className="co-label--plain" htmlFor={inputId}>
              {column.title}
            </label>
          </DataListCell>,
        ]}
      />
    </DataListItemRow>
  </DataListItem>
);

export default DataListRow;
