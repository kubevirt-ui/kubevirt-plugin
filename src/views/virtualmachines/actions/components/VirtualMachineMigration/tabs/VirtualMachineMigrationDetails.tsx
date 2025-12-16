import React, { FC, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { Updater } from 'use-immer';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  Alert,
  AlertVariant,
  Content,
  ContentVariants,
  Radio,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { SelectedMigration } from '../utils/constants';
import { getAllVolumesCount } from '../utils/utils';
import { getAllSelectedMigrations } from '../utils/utils';

import SelectedStorageTooltip from './components/SelectedStorageTooltip';
import SelectMigrationDisksTable from './components/SelectMigrationDisksTable';

type VirtualMachineMigrationDetailsProps = {
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setSelectedMigrations: Updater<SelectedMigration[]>;
  vms: V1VirtualMachine[];
};

const VirtualMachineMigrationDetails: FC<VirtualMachineMigrationDetailsProps> = ({
  pvcs,
  selectedPVCs,
  setSelectedMigrations,
  vms,
}) => {
  const { t } = useKubevirtTranslation();

  const [allPVCsSelected, setAllPVCsSelected] = useState(true);

  const volumesCount = useMemo(() => getAllVolumesCount(vms), [vms]);

  const storageClasses = Array.from(new Set(pvcs?.map((pvc) => pvc?.spec?.storageClassName)));

  const totalAmount = humanizeBinaryBytes(
    selectedPVCs?.reduce((acc, pvc) => {
      acc += convertToBaseValue(pvc?.spec?.resources?.requests?.storage);
      return acc;
    }, 0),
  )?.string;

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2">{t('Migration details')}</Title>
        <Content component={ContentVariants.p}>
          {vms.length === 1 ? (
            <Trans t={t}>
              <Content>
                Select the storage to migrate for{' '}
                <MulticlusterResourceLink
                  cluster={getCluster(vms?.[0])}
                  groupVersionKind={VirtualMachineModelGroupVersionKind}
                  inline
                  name={getName(vms?.[0])}
                  namespace={getNamespace(vms?.[0])}
                />
                from the source (current) storage class{' '}
                {{ storageClasses: storageClasses?.join(', ') }}
              </Content>
            </Trans>
          ) : (
            <Trans t={t}>
              <Content>
                Select the storage to migrate for{' '}
                <SelectedStorageTooltip vms={vms}>
                  {{ vmsCount: vms?.length }} VirtualMachines with {{ volumesCount }} Volumes
                </SelectedStorageTooltip>{' '}
                from the source (current) storage class{' '}
                {{ storageClasses: storageClasses?.join(', ') }}
              </Content>
            </Trans>
          )}
        </Content>
      </StackItem>
      <StackItem>
        <Radio
          onChange={() => {
            setAllPVCsSelected(true);
            setSelectedMigrations(getAllSelectedMigrations(vms, pvcs));
          }}
          id="all-volumes"
          isChecked={allPVCsSelected}
          isDisabled={isEmpty(pvcs)}
          label={t('The entire VirtualMachine')}
          name="volumes"
        />
        <Radio
          onChange={() => {
            setAllPVCsSelected(false);
            setSelectedMigrations([]);
          }}
          id="selected-volumes"
          isChecked={!allPVCsSelected}
          isDisabled={isEmpty(pvcs)}
          label={t('Selected volumes')}
          name="volumes"
        />
      </StackItem>
      {!allPVCsSelected && (
        <StackItem>
          <SelectMigrationDisksTable
            pvcs={pvcs}
            selectedPVCs={selectedPVCs}
            setSelectedMigrations={setSelectedMigrations}
            vms={vms}
          />
        </StackItem>
      )}

      {isEmpty(pvcs) ? (
        <Alert title={t('No migratable disks')} variant={AlertVariant.danger} />
      ) : (
        <Alert
          title={t('Total storage to migrate is {{totalAmount}}', { totalAmount })}
          variant={AlertVariant.info}
        />
      )}
    </Stack>
  );
};

export default VirtualMachineMigrationDetails;
