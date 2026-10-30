import type { FC, FormEvent } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import type { ManagedColumn } from '@openshift-console/dynamic-plugin-sdk';
import {
  DataList,
  DataListCell,
  DataListCheck,
  DataListControl,
  DataListDragButton,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';
import { DragDrop, Draggable, Droppable } from '@patternfly/react-core/deprecated';

import { NAME_COLUMN_ID } from './constants';
import { createInputId } from './utils';

type ColumnManagementUnifiedListProps = {
  areMaxColumnsDisplayed: boolean;
  checkedColumnIds: Set<string>;
  columnsById: Map<string, ManagedColumn>;
  onColumnChange: (event: FormEvent<HTMLInputElement>) => void;
  onReorder: (orderedColumnIds: string[]) => void;
  orderedAllColumnIds: string[];
};

const reorderList = (list: string[], startIndex: number, endIndex: number): string[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const ColumnManagementUnifiedList: FC<ColumnManagementUnifiedListProps> = ({
  areMaxColumnsDisplayed,
  checkedColumnIds,
  columnsById,
  onColumnChange,
  onReorder,
  orderedAllColumnIds,
}) => {
  const { t } = useKubevirtTranslation();

  const onDrop = (source, dest): boolean | undefined => {
    if (dest) {
      onReorder(reorderList(orderedAllColumnIds, source.index, dest.index));
      return true;
    }
  };

  return (
    <DragDrop onDrop={onDrop}>
      <Droppable hasNoWrapper>
        <DataList
          aria-label={t('Manage columns list')}
          className="kubevirt-column-management-unified-list"
          isCompact
        >
          {orderedAllColumnIds.map((columnId) => {
            const column = columnsById.get(columnId);
            if (!column) {
              return null;
            }

            const inputId = createInputId(columnId);
            const isChecked = checkedColumnIds.has(columnId);
            const isDisabled =
              columnId === NAME_COLUMN_ID || (areMaxColumnsDisplayed && !isChecked);

            return (
              <Draggable hasNoWrapper key={columnId}>
                <DataListItem aria-labelledby={`table-column-management-item-${columnId}`}>
                  <DataListItemRow>
                    <DataListControl>
                      <DataListDragButton
                        aria-describedby={`table-column-management-item-${columnId}`}
                        aria-label={t('Reorder')}
                        data-test={`column-reorder-handle-${columnId}`}
                      />
                    </DataListControl>
                    <DataListCheck
                      aria-labelledby={`table-column-management-item-${columnId}`}
                      id={inputId}
                      isChecked={isChecked}
                      isDisabled={isDisabled}
                      name={column.title}
                      onChange={onColumnChange}
                    />
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell
                          id={`table-column-management-item-${columnId}`}
                          key={columnId}
                        >
                          {column.title}
                        </DataListCell>,
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>
              </Draggable>
            );
          })}
        </DataList>
      </Droppable>
    </DragDrop>
  );
};

export default ColumnManagementUnifiedList;
