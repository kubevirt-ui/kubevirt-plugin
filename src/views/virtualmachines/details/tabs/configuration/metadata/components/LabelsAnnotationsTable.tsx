import React, { type FC, type ReactNode } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import MetadataEmptyState from './MetadataEmptyState';

type LabelsAnnotationsTableProps = {
  addButtonLabel: string;
  canDelete?: (key: string) => boolean;
  dataTest: string;
  editable: boolean;
  emptyMessage: string;
  entries: [string, string][];
  helpText: string;
  onAdd: () => void;
  onDelete: (key: string) => void;
  renderValue: (key: string, value: string) => ReactNode;
  searchId: string;
  title: string;
};

const LabelsAnnotationsTable: FC<LabelsAnnotationsTableProps> = ({
  addButtonLabel,
  canDelete = (): boolean => true,
  dataTest,
  editable,
  emptyMessage,
  entries,
  helpText,
  onAdd,
  onDelete,
  renderValue,
  searchId,
  title,
}) => {
  const { t } = useKubevirtTranslation();

  const header = (
    <CardHeader>
      <CardTitle className="metadata-tab__card-title">
        <SearchItem id={searchId}>{title}</SearchItem>
        <HelpTextIcon bodyContent={helpText} />
      </CardTitle>
    </CardHeader>
  );

  if (isEmpty(entries)) {
    return (
      <Card className="metadata-tab__table-card pf-v6-u-mb-md" data-test={dataTest}>
        {header}
        <CardBody>
          <MetadataEmptyState
            addButtonLabel={addButtonLabel}
            dataTest={dataTest}
            editable={editable}
            emptyMessage={emptyMessage}
            onAdd={onAdd}
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="metadata-tab__table-card pf-v6-u-mb-md" data-test={dataTest}>
      {header}
      <CardBody>
        {editable && (
          <Button
            className="pf-v6-u-mb-md"
            data-test={`${dataTest}-add-btn`}
            onClick={onAdd}
            variant={ButtonVariant.primary}
          >
            {addButtonLabel}
          </Button>
        )}
        <Table data-test={`${dataTest}-table`} variant="compact">
          <Thead>
            <Tr>
              <Th>{t('Key')}</Th>
              <Th>{t('Value')}</Th>
              {editable && <Th className="pf-v6-c-table__action" />}
            </Tr>
          </Thead>
          <Tbody>
            {entries.map(([key, value]) => (
              <Tr key={key}>
                <Td dataLabel={t('Key')}>{key}</Td>
                <Td dataLabel={t('Value')}>{renderValue(key, value)}</Td>
                {editable && (
                  <Td className="pf-v6-c-table__action">
                    {canDelete(key) && (
                      <Button
                        aria-label={t('Remove {{key}}', { key })}
                        data-test={`delete-${searchId}-${key}`}
                        icon={<MinusCircleIcon />}
                        onClick={() => onDelete(key)}
                        variant={ButtonVariant.plain}
                      />
                    )}
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default LabelsAnnotationsTable;
