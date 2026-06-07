import React, { FC, ReactNode } from 'react';
import { TFunction } from 'i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

type KeyValueTableProps = {
  data: Record<string, string>;
  'data-test'?: string;
  deletingKey?: null | string;
  onClickValue?: (key: string, value: string) => void;
  onDelete?: (key: string) => void;
  valueRenderer?: (key: string, value: string) => ReactNode;
};

const renderValue = (
  key: string,
  value: string,
  t: TFunction,
  valueRenderer?: KeyValueTableProps['valueRenderer'],
  onClickValue?: KeyValueTableProps['onClickValue'],
): ReactNode => {
  if (valueRenderer) return valueRenderer(key, value);

  if (onClickValue)
    return (
      <Button
        aria-label={t('Search for {{key}}={{value}}', { key, value })}
        isInline
        onClick={() => onClickValue(key, value)}
        variant={ButtonVariant.link}
      >
        {value}
      </Button>
    );

  return value;
};

const KeyValueTable: FC<KeyValueTableProps> = ({
  data,
  'data-test': dataTest,
  deletingKey,
  onClickValue,
  onDelete,
  valueRenderer,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Table data-test={dataTest} variant="compact">
      <Thead>
        <Tr>
          <Th width={40}>{t('Key')}</Th>
          <Th width={50}>{t('Value')}</Th>
          {onDelete && <Th width={10} />}
        </Tr>
      </Thead>
      <Tbody>
        {Object.entries(data).map(([key, value]) => (
          <Tr key={key}>
            <Td dataLabel={t('Key')}>{key}</Td>
            <Td dataLabel={t('Value')}>
              {renderValue(key, value, t, valueRenderer, onClickValue)}
            </Td>
            {onDelete && (
              <Td dataLabel={t('Actions')} isActionCell>
                <Button
                  aria-label={t('Remove {{key}}', { key })}
                  icon={<MinusCircleIcon />}
                  isDisabled={deletingKey === key}
                  isLoading={deletingKey === key}
                  onClick={() => onDelete(key)}
                  variant={ButtonVariant.plain}
                />
              </Td>
            )}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default KeyValueTable;
