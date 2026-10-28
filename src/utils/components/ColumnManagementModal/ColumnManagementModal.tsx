import { type FC, type FormEvent, type MouseEventHandler, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { type ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import ColumnManagementModalFooter from './ColumnManagementModalFooter';
import {
  getHiddenSelectedColumnIds,
  getInitialCheckedManageableColumnIds,
  getInitialOrderedAllColumnIds,
  getOrderedCheckedColumnIds,
  mergeColumnIdsForSave,
} from './columnManagementModalUtils';
import ColumnManagementUnifiedList from './ColumnManagementUnifiedList';
import { getColumnId, getMaxColumnsToSelect } from './utils';

import './column-management-modal.scss';

type ColumnManagementModalProps = {
  columnLayout: ColumnLayout;
  isOpen: boolean;
  onClose: () => void;
};

export const ColumnManagementModal: FC<ColumnManagementModalProps> = ({
  columnLayout,
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const { columns, id, selectedColumns, showNamespaceOverride } = columnLayout;

  const defaultColumnIds = columns.reduce<string[]>((ids, column) => {
    if (column.id && !column.additional) {
      ids.push(column.id);
    }
    return ids;
  }, []);

  const [_activeColumns, setActiveColumns, loaded, error] = useKubevirtUserSettingsTableColumns({
    columnManagementID: id,
    columns,
  });

  const [hiddenSelectedColumnIds] = useState<string[]>(() =>
    getHiddenSelectedColumnIds(selectedColumns, columns),
  );

  const [orderedAllColumnIds, setOrderedAllColumnIds] = useState<string[]>(() =>
    getInitialOrderedAllColumnIds(columns, selectedColumns, defaultColumnIds),
  );

  const [checkedColumnIds, setCheckedColumnIds] = useState<Set<string>>(
    () => new Set(getInitialCheckedManageableColumnIds(selectedColumns, columns, defaultColumnIds)),
  );

  const columnsById = useMemo(
    () => new Map(columns.map((column) => [column.id, column])),
    [columns],
  );

  const onColumnChange = (event: FormEvent<HTMLInputElement>): void => {
    const selectedId = getColumnId(event?.currentTarget?.id);

    setCheckedColumnIds((previous) => {
      const updated = new Set(previous);
      if (updated.has(selectedId)) {
        updated.delete(selectedId);
      } else {
        updated.add(selectedId);
      }
      return updated;
    });
  };

  const submit: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();
    const orderedChecked = getOrderedCheckedColumnIds(orderedAllColumnIds, checkedColumnIds);
    await setActiveColumns(mergeColumnIdsForSave(hiddenSelectedColumnIds, orderedChecked));
    onClose();
  };

  const maxColumnsToSelect = getMaxColumnsToSelect(columns);
  const totalCheckedCount = hiddenSelectedColumnIds.length + checkedColumnIds.size;
  const areMaxColumnsDisplayed =
    totalCheckedCount - (hiddenSelectedColumnIds.includes('') ? 1 : 0) >= maxColumnsToSelect;

  const resetColumns = (): void => {
    setOrderedAllColumnIds(getInitialOrderedAllColumnIds(columns, undefined, defaultColumnIds));
    setCheckedColumnIds(new Set(defaultColumnIds));
  };

  const selectedCount = checkedColumnIds.size;

  return (
    <Modal
      data-test="dialog-modal"
      isOpen={isOpen}
      onClose={onClose}
      position="top"
      variant={ModalVariant.small}
    >
      <ModalHeader title={t('Manage and reorder columns')} />
      <ModalBody>
        <p className="co-m-form-row">
          {t('Selected columns will be displayed in the table. Drag and drop to reorder columns.')}
        </p>
        {!showNamespaceOverride && (
          <p className="co-m-form-row pf-v6-u-mt-sm">
            {t('The namespace column is only shown when in "All projects"')}
          </p>
        )}
        <p className="co-m-form-row pf-v6-u-mt-sm">
          {t('You can select up to {{maxColumnsToSelect}} columns', { maxColumnsToSelect })}
        </p>
        <Button
          className="pf-v6-u-p-0 pf-v6-u-mt-md"
          data-test="reset-button"
          onClick={resetColumns}
          variant={ButtonVariant.link}
        >
          {t('Reset to default')}
        </Button>
        <p className="control-label pf-v6-u-mt-lg">
          {t('{{count}} selected', { count: selectedCount })}
        </p>
        <ColumnManagementUnifiedList
          areMaxColumnsDisplayed={areMaxColumnsDisplayed}
          checkedColumnIds={checkedColumnIds}
          columnsById={columnsById}
          onColumnChange={onColumnChange}
          onReorder={setOrderedAllColumnIds}
          orderedAllColumnIds={orderedAllColumnIds}
        />
      </ModalBody>
      <ColumnManagementModalFooter
        error={error}
        loaded={loaded}
        onClose={onClose}
        submit={submit}
      />
    </Modal>
  );
};
