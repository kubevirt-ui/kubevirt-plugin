import React, { FC, useMemo } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  modelToGroupVersionKind,
  StorageClassModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  Alert,
  AlertVariant,
  Content,
  ContentVariants,
  Icon,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';

import { getAllVolumesCount } from '../utils/utils';

import ReviewVolumesColumn from './components/ReviewVolumesColumn';

type VirtualMachineMigrationReviewTabProps = {
  defaultStorageClassName: string;
  destinationStorageClass: string;
  keepOriginalVolumes: boolean;
  migrationError: Error;
  migrationPlanName: string;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  vms: V1VirtualMachine[];
  vmStorageClassNames: string[];
};

const StorageClassModelGroupVersionKind = modelToGroupVersionKind(StorageClassModel);

const VirtualMachineMigrationReviewTab: FC<VirtualMachineMigrationReviewTabProps> = ({
  defaultStorageClassName,
  destinationStorageClass,
  keepOriginalVolumes,
  migrationError,
  migrationPlanName,
  pvcs,
  vms,
  vmStorageClassNames,
}) => {
  const { t } = useKubevirtTranslation();

  const allVolumesCount = useMemo(() => getAllVolumesCount(vms), [vms]);
  const cluster = getCluster(vms?.[0]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2">{t('Review')}</Title>
        <Content component={ContentVariants.p}>
          {t(
            'Review the details to make sure everything looks right before starting the migration.',
          )}
        </Content>
      </StackItem>
      <StackItem>
        <Table aria-label={t('Review')} borders={false} variant="compact">
          <Tbody>
            <Tr>
              <Td width={30}>
                <strong>{t('VirtualMachine')}</strong>
              </Td>
              <Td>
                {vms.length === 1 ? (
                  <MulticlusterResourceLink
                    cluster={cluster}
                    groupVersionKind={VirtualMachineModelGroupVersionKind}
                    inline
                    name={getName(vms[0])}
                    namespace={getNamespace(vms[0])}
                  />
                ) : (
                  t('{{vmCount}} VirtualMachines', { vmCount: vms.length })
                )}
              </Td>
            </Tr>
            <Tr>
              <Td width={30}>
                <strong>{t('Storage migration plan name')}</strong>
              </Td>
              <Td>{migrationPlanName}</Td>
            </Tr>
            <Tr>
              <Td width={30}>
                <strong>{t('Source StorageClass')}</strong>
              </Td>
              <Td>
                {vmStorageClassNames.map((scName) => (
                  <MulticlusterResourceLink
                    cluster={cluster}
                    groupVersionKind={StorageClassModelGroupVersionKind}
                    inline
                    key={scName}
                    name={scName}
                  />
                ))}
              </Td>
            </Tr>
            <Tr>
              <Td width={30}>
                <strong>{t('Target StorageClass')}</strong>
              </Td>
              <Td>
                <MulticlusterResourceLink
                  cluster={cluster}
                  groupVersionKind={StorageClassModelGroupVersionKind}
                  inline
                  linkTo={false}
                  name={destinationStorageClass}
                />
                {defaultStorageClassName === destinationStorageClass && ` (${t('default')})`}
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
            <Tr>
              <Td width={30}>
                <strong>{t('Post-migration cleanup')}</strong>
              </Td>
              <Td>
                {keepOriginalVolumes ? (
                  <>
                    <Icon isInline status="info">
                      <InfoCircleIcon />
                    </Icon>{' '}
                    {t('Keep original volumes')}
                  </>
                ) : (
                  t('Decommission source volumes')
                )}
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
