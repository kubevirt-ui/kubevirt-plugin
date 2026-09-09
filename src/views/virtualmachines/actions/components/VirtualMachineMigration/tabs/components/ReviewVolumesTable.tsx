import React, { type FC } from 'react';

import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  modelToGroupVersionKind,
  StorageClassModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { Icon } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';

import ReviewVolumesColumn from './ReviewVolumesColumn';

const StorageClassModelGroupVersionKind = modelToGroupVersionKind(StorageClassModel);

type ReviewVolumesTableProps = {
  allVolumesCount: number;
  cluster: string | undefined;
  defaultStorageClassName: string;
  destinationStorageClass: string;
  keepOriginalVolumes: boolean;
  migrationPlanName: string;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  vms: V1VirtualMachine[];
  vmStorageClassNames: string[];
};

const ReviewVolumesTable: FC<ReviewVolumesTableProps> = ({
  allVolumesCount,
  cluster,
  defaultStorageClassName,
  destinationStorageClass,
  keepOriginalVolumes,
  migrationPlanName,
  pvcs,
  vms,
  vmStorageClassNames,
}) => {
  const { t } = useKubevirtTranslation();

  return (
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
  );
};

export default ReviewVolumesTable;
