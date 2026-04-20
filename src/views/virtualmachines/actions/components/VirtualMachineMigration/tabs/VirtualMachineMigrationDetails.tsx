import React, { FCC, useState } from 'react';
import { Trans } from 'react-i18next';
import { Updater } from 'use-immer';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getDNS1123LabelError, isDNS1123Label } from '@kubevirt-utils/utils/validation';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  Popover,
  Radio,
  Stack,
  StackItem,
  TextInput,
  Title,
  ValidatedOptions,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { SelectedMigration } from '../utils/constants';
import { getAllSelectedMigrations } from '../utils/utils';

import SelectedStorageTooltip from './components/SelectedStorageTooltip';
import SelectMigrationDisksTable from './components/SelectMigrationDisksTable';

type VirtualMachineMigrationDetailsProps = {
  migrationPlanName: string;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setMigrationPlanName: (name: string) => void;
  setSelectedMigrations: Updater<SelectedMigration[]>;
  vms: V1VirtualMachine[];
};

const VirtualMachineMigrationDetails: FCC<VirtualMachineMigrationDetailsProps> = ({
  migrationPlanName,
  pvcs,
  selectedPVCs,
  setMigrationPlanName,
  setSelectedMigrations,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const [allPVCsSelected, setAllPVCsSelected] = useState(true);

  const isNameValid = isDNS1123Label(migrationPlanName);

  const totalAmount = humanizeBinaryBytes(
    selectedPVCs?.reduce((acc, pvc) => {
      acc += convertToBaseValue(pvc?.spec?.resources?.requests?.storage);
      return acc;
    }, 0),
  )?.string;

  const vmCount = vms?.length;

  return (
    <Form>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2">{t('Migration details')}</Title>
          <Content component={ContentVariants.p}>
            {vmCount === 1 ? (
              <Content>
                {t('Enter storage migration details for:')}{' '}
                <MulticlusterResourceLink
                  cluster={getCluster(vms?.[0])}
                  groupVersionKind={VirtualMachineModelGroupVersionKind}
                  inline
                  name={getName(vms?.[0])}
                  namespace={getNamespace(vms?.[0])}
                />
              </Content>
            ) : (
              <Trans t={t} values={{ vmsCount: vmCount }}>
                Enter storage migration details for{' '}
                <SelectedStorageTooltip vms={vms}>
                  {'{{vmsCount}}'} VirtualMachines
                </SelectedStorageTooltip>
              </Trans>
            )}
          </Content>
        </StackItem>
        <StackItem>
          <FormGroup
            labelHelp={
              <Popover
                bodyContent={t(
                  'A unique name to identify this storage migration plan. This name will be used to track the migration progress.',
                )}
              >
                <Button hasNoPadding icon={<HelpIcon />} variant={ButtonVariant.plain} />
              </Popover>
            }
            fieldId="migration-plan-name"
            isRequired
            label={t('VirtualMachine storage migration plan name')}
          >
            <TextInput
              id="migration-plan-name"
              isRequired
              onChange={(_, value) => setMigrationPlanName(value)}
              validated={isNameValid ? ValidatedOptions.default : ValidatedOptions.error}
              value={migrationPlanName}
            />
            {!isNameValid && (
              <FormGroupHelperText validated={ValidatedOptions.error}>
                {getDNS1123LabelError(migrationPlanName)?.(t)}
              </FormGroupHelperText>
            )}
          </FormGroup>
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
    </Form>
  );
};

export default VirtualMachineMigrationDetails;
