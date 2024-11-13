import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
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

import { getVolumeFromPVC } from '../utils';

type VirtualMachineMigrationReviewTabProps = {
  defaultStorageClassName: string;
  destinationStorageClass: string;
  migrationError: Error;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  vm: V1VirtualMachine;
};

const VirtualMachineMigrationReviewTab: FC<VirtualMachineMigrationReviewTabProps> = ({
  defaultStorageClassName,
  destinationStorageClass,
  migrationError,
  pvcs,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const volumes = getVolumes(vm);

  const volumesToMigrate = getVolumeFromPVC(volumes, pvcs);

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
                    allCount: volumes?.length,
                    migrationCount: volumesToMigrate?.length,
                  })}
                </strong>
              </Td>
              <Td>
                {volumesToMigrate.map((volume) => (
                  <div key={volume.name}>{volume.name}</div>
                ))}
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
