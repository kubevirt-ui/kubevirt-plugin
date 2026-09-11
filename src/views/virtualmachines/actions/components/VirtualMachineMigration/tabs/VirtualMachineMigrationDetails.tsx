import { type FC } from 'react';
import { Trans } from 'react-i18next';
import { type Updater } from 'use-immer';

import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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
  Stack,
  StackItem,
  TextInput,
  Title,
  ValidatedOptions,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { type SelectedMigration } from '../utils/constants';
import MigrationVolumeSelection from './components/MigrationVolumeSelection';
import SelectedStorageTooltip from './components/SelectedStorageTooltip';

type VirtualMachineMigrationDetailsProps = {
  migrationPlanName: string;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setMigrationPlanName: (name: string) => void;
  setSelectedMigrations: Updater<SelectedMigration[]>;
  vms: V1VirtualMachine[];
};

const VirtualMachineMigrationDetails: FC<VirtualMachineMigrationDetailsProps> = ({
  migrationPlanName,
  pvcs,
  selectedPVCs,
  setMigrationPlanName,
  setSelectedMigrations,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const isNameValid = isDNS1123Label(migrationPlanName);

  const totalAmount = humanizeBinaryBytes(
    selectedPVCs?.reduce(
      (acc: number, pvc): number =>
        acc + (convertToBaseValue(pvc?.spec?.resources?.requests?.storage) ?? 0),
      0,
    ),
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
            fieldId="migration-plan-name"
            isRequired
            label={t('VirtualMachine storage migration plan name')}
            labelHelp={
              <Popover
                bodyContent={t(
                  'A unique name to identify this storage migration plan. This name will be used to track the migration progress.',
                )}
              >
                <Button hasNoPadding icon={<HelpIcon />} variant={ButtonVariant.plain} />
              </Popover>
            }
          >
            <TextInput
              id="migration-plan-name"
              isRequired
              onChange={(_event, value): void => setMigrationPlanName(value)}
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
        <MigrationVolumeSelection
          pvcs={pvcs}
          selectedPVCs={selectedPVCs}
          setSelectedMigrations={setSelectedMigrations}
          vms={vms}
        />
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
