import React, { FC, FormEvent, MouseEventHandler, SyntheticEvent, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  DataList,
  Flex,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
} from '@patternfly/react-core';

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

  const [_, setActiveColumns, loaded, error] = useKubevirtUserSettingsTableColumns({
    columnManagementID: id,
    columns,
  });

  const [checkedColumns, setCheckedColumns] = useState<Set<string>>(
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
    checkedColumns.forEach((ids) => orderedCheckedColumns.add(ids));

    await setActiveColumns([...orderedCheckedColumns]);
    onClose();
  };

  const maxColumnsToSelect = getMaxColumnsToSelect(columns);
  const areMaxColumnsDisplayed =
    checkedColumns.size - (checkedColumns.has('') ? 1 : 0) >= maxColumnsToSelect;

  const resetColumns = (event: SyntheticEvent): void => {
    event.preventDefault();
    const updatedCheckedColumns = new Set(checkedColumns);
    defaultColumns.forEach((col) => col.id && updatedCheckedColumns.add(col.id));
    additionalColumns.forEach((col) => updatedCheckedColumns.delete(col.id));
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
        <div className="row co-m-form-row pf-v6-u-mt-lg">
          <div className="col-sm-12">
            <span className="col-sm-6">
              <label className="control-label">
                {t('Default {{resourceKind}} columns', { resourceKind: type })}
              </label>
              <DataList
                aria-label={t('Default column list')}
                id="defalt-column-management"
                isCompact
              >
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
            </span>
            <span className="col-sm-6">
              <label className="control-label">{t('Additional columns')}</label>
              <DataList
                aria-label={t('Additional column list')}
                id="additional-column-management"
                isCompact
              >
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
            </span>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Stack className="kv-tabmodal-footer" hasGutter>
          {error && (
            <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
              {error.message}
            </Alert>
          )}
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              data-test="save-button"
              form="modal-with-form-form"
              isDisabled={!loaded}
              isLoading={!loaded}
              key="create"
              onClick={submit}
              variant={ButtonVariant.primary}
            >
              {t('Save')}
            </Button>
            <Button
              data-test="reset-button"
              key="reset"
              onClick={resetColumns}
              variant={ButtonVariant.secondary}
            >
              {t('Restore default columns')}
            </Button>
            <Button data-test="cancel-button" onClick={onClose} variant={ButtonVariant.link}>
              {t('Cancel')}
            </Button>
          </Flex>
        </Stack>
      </ModalFooter>
    </Modal>
  );
};
