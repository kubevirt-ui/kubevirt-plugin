import React, {
  type FC,
  type FormEvent,
  type MouseEventHandler,
  type SyntheticEvent,
  useState,
} from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { type ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  DataList,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import ColumnManagementModalFooter from './ColumnManagementModalFooter';
import DataListRow from './DataListRow';
import { createInputId, getColumnId, getMaxColumnsToSelect } from './utils';

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
  const { columns, id, selectedColumns, showNamespaceOverride, type } = columnLayout;

  const defaultColumns = columns.filter((column) => column.id && !column.additional);
  const additionalColumns = columns.filter((column) => column.additional);

  const [_activeColumns, setActiveColumns, loaded, error] = useKubevirtUserSettingsTableColumns({
    columnManagementID: id,
    columns,
  });

  const [checkedColumns, setCheckedColumns] = useState<Set<string>>(() =>
    selectedColumns && selectedColumns.size !== 0
      ? new Set(selectedColumns)
      : new Set(defaultColumns.map((col) => col.id)),
  );

  const onColumnChange = (event: FormEvent<HTMLInputElement>): void => {
    const updatedCheckedColumns = new Set<string>(checkedColumns);
    const selectedId = getColumnId(event?.currentTarget?.id);
    updatedCheckedColumns.has(selectedId)
      ? updatedCheckedColumns.delete(selectedId)
      : updatedCheckedColumns.add(selectedId);
    setCheckedColumns(updatedCheckedColumns);
  };

  const submit: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();
    const orderedCheckedColumns = new Set<string>();
    for (const ids of checkedColumns) orderedCheckedColumns.add(ids);

    await setActiveColumns([...orderedCheckedColumns]);
    onClose();
  };

  const maxColumnsToSelect = getMaxColumnsToSelect(columns);
  const areMaxColumnsDisplayed =
    checkedColumns.size - (checkedColumns.has('') ? 1 : 0) >= maxColumnsToSelect;

  const resetColumns = (event: SyntheticEvent): void => {
    event.preventDefault();
    const updatedCheckedColumns = new Set(checkedColumns);
    for (const col of defaultColumns) col.id && updatedCheckedColumns.add(col.id);
    for (const col of additionalColumns) updatedCheckedColumns.delete(col.id);
    setCheckedColumns(updatedCheckedColumns);
  };

  return (
    <Modal
      data-test="dialog-modal"
      isOpen={isOpen}
      onClose={onClose}
      position="top"
      variant={ModalVariant.small}
    >
      <ModalHeader title={t('Manage columns')} />
      <ModalBody>
        <p className="co-m-form-row">{t('Selected columns will appear in the table.')}</p>
        <Alert
          isInline
          title={t('You can select up to {{maxColumnsToSelect}} columns', { maxColumnsToSelect })}
          variant={AlertVariant.info}
        >
          {!showNamespaceOverride && t('The namespace column is only shown when in "All projects"')}
        </Alert>
        <div className="co-m-form-row pf-v6-u-mt-lg">
          <Grid hasGutter>
            <GridItem sm={6}>
              <label className="control-label">
                {t('Default {{resourceKind}} columns', { resourceKind: type })}
              </label>
              <DataList aria-label={t('Default column list')} isCompact>
                {defaultColumns.map((defaultColumn) => (
                  <DataListRow
                    checkedColumns={checkedColumns}
                    column={defaultColumn}
                    disableUncheckedRow={areMaxColumnsDisplayed}
                    inputId={createInputId(defaultColumn.id)}
                    key={defaultColumn.id}
                    onChange={onColumnChange}
                  />
                ))}
              </DataList>
            </GridItem>
            <GridItem sm={6}>
              <label className="control-label">{t('Additional columns')}</label>
              <DataList aria-label={t('Additional column list')} isCompact>
                {additionalColumns.map((additionalColumn) => (
                  <DataListRow
                    checkedColumns={checkedColumns}
                    column={additionalColumn}
                    disableUncheckedRow={areMaxColumnsDisplayed}
                    inputId={createInputId(additionalColumn.id)}
                    key={additionalColumn.id}
                    onChange={onColumnChange}
                  />
                ))}
              </DataList>
            </GridItem>
          </Grid>
        </div>
      </ModalBody>
      <ColumnManagementModalFooter
        error={error}
        loaded={loaded}
        onClose={onClose}
        resetColumns={resetColumns}
        submit={submit}
      />
    </Modal>
  );
};
