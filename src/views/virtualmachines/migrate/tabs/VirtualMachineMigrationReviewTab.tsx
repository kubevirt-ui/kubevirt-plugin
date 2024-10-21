import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Stack,
  StackItem,
  Text,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';

type VirtualMachineMigrationReviewTabProps = {
  defaultStorageClassName: string;
  destinationStorageClass: string;
  migrationError: Error;
};

const VirtualMachineMigrationReviewTab: FC<VirtualMachineMigrationReviewTabProps> = ({
  defaultStorageClassName,
  destinationStorageClass,
  migrationError,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2">{t('Review')}</Title>
        <Text component={TextVariants.p}>
          <Trans t={t}>
            Verify the details and click <strong>Migrate VirtualMachine storage</strong> to start
            the migration
          </Trans>
        </Text>
      </StackItem>
      <StackItem>
        <Table aria-label={t('Review')} borders={false} variant="compact">
          <Tbody>
            <Tr>
              <Td width={20}>
                <strong>Migration type</strong>
              </Td>
              <Td>VirtualMachine storage</Td>
            </Tr>
            <Tr>
              <Td width={20}>
                <strong>Destination StorageClass</strong>
              </Td>
              <Td>
                {destinationStorageClass}{' '}
                {defaultStorageClassName === destinationStorageClass ? '(default)' : ''}
              </Td>
            </Tr>
          </Tbody>
        </Table>

        {migrationError && (
          <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
            {migrationError?.message}
          </Alert>
        )}
      </StackItem>
    </Stack>
  );
};

export default VirtualMachineMigrationReviewTab;
