import React, { FC, useMemo } from 'react';
import { Trans } from 'react-i18next';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Content,
  ContentVariants,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';

import { getAllVolumesCount } from '../utils/utils';

import ReviewVolumesColumn from './components/ReviewVolumesColumn';

type VirtualMachineMigrationReviewTabProps = {
  defaultStorageClassName: string;
  destinationStorageClass: string;
  migrationError: Error;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  vms: V1VirtualMachine[];
};

const VirtualMachineMigrationReviewTab: FC<VirtualMachineMigrationReviewTabProps> = ({
  defaultStorageClassName,
  destinationStorageClass,
  migrationError,
  pvcs,
  vms,
}) => {
  const { t } = useKubevirtTranslation();

  const allVolumesCount = useMemo(() => getAllVolumesCount(vms), [vms]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2">{t('Review')}</Title>
        <Content component={ContentVariants.p}>
          <Trans t={t}>
            Verify the details and click <strong>Migrate VirtualMachine storage</strong> to start
            the migration
          </Trans>
        </Content>
      </StackItem>
      <StackItem>
        <Table aria-label={t('Review')} borders={false} variant="compact">
          <Tbody>
            <Tr>
              <Td width={30}>
                <strong>{t('Migration type')}</strong>
              </Td>
              <Td>{t('VirtualMachine storage')}</Td>
            </Tr>
            <Tr>
              <Td width={30}>
                <strong>{t('Destination StorageClass')}</strong>
              </Td>
              <Td>
                {destinationStorageClass}{' '}
                {defaultStorageClassName === destinationStorageClass ? '(default)' : ''}
              </Td>
            </Tr>
            <Tr>
              <Td width={30}>
                <strong>
                  {t('Migrating {{migrationCount}} out of {{allCount}}', {
                    allCount: allVolumesCount,
                    migrationCount: pvcs?.length,
                  })}
                </strong>
              </Td>
              <Td>
                <ReviewVolumesColumn pvcsToMigrate={pvcs} vms={vms} />
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
