import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

type KeyValueTableProps = {
  data: Record<string, string>;
  'data-test'?: string;
  onClickValue?: (key: string, value: string) => void;
  onDelete?: (key: string) => void;
};

const KeyValueTable: FC<KeyValueTableProps> = ({
  data,
  'data-test': dataTest,
  onClickValue,
  onDelete,
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
              {onClickValue ? (
                <Button
                  isInline
                  onClick={() => onClickValue(key, value)}
                  variant={ButtonVariant.link}
                >
                  {value}
                </Button>
              ) : (
                value
              )}
            </Td>
            {onDelete && (
              <Td dataLabel={t('Actions')} isActionCell>
                <Button
                  aria-label={t('Remove {{key}}', { key })}
                  icon={<MinusCircleIcon />}
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
