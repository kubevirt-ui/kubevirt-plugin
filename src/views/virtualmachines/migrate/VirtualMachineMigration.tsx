import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  modelToGroupVersionKind,
  StorageClassModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import useDisksSources from '@kubevirt-utils/resources/vm/hooks/disk/useDisksSources';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Bullseye,
  Stack,
  StackItem,
  Title,
  Wizard,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';

import { migrateVM } from './utils';

const StorageClassModelGroupVersionKind = modelToGroupVersionKind(StorageClassModel);

const VirtualMachineMigrate: FC = () => {
  const { t } = useKubevirtTranslation();

  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const [selectedStorageClass, setSelectedStorageClass] = useState('');
  const [migrationError, setMigrationError] = useState<Error | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);

  const navigate = useNavigate();

  const [vm, loaded, error] = useK8sWatchResource<V1VirtualMachine>(
    name
      ? {
          groupVersionKind: VirtualMachineModelGroupVersionKind,
          name,
          namespace,
        }
      : null,
  );

  const { pvcs } = useDisksSources(vm);

  const [{ clusterDefaultStorageClass, sortedStorageClasses }, scLoaded] = useDefaultStorageClass();

  const defaultStorageClassName = getName(clusterDefaultStorageClass);

  const destinationStorageClass = selectedStorageClass || defaultStorageClassName;

  const onSubmit = async () => {
    setMigrationLoading(true);
    setMigrationError(null);
    try {
      await migrateVM(vm, pvcs, destinationStorageClass);

      navigate(-1);
    } catch (apiError) {
      setMigrationError(apiError);
    }

    setMigrationLoading(false);
  };

  if (!loaded && !scLoaded)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  if (error)
    return (
      <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
        {error?.message}
      </Alert>
    );

  return (
    <Wizard
      header={
        <WizardHeader
          closeButtonAriaLabel={t('Close header')}
          description={t('Migrate VirtualMachine storage to a different StorageClass.')}
          title={t('Migrate VirtualMachine storage')}
        />
      }
      onClose={() => navigate(-1)}
      onSave={onSubmit}
      title={t('Migrate VirtualMachine storage')}
    >
      <WizardStep id="wizard-migrate-destination" name={t('Destination StorageClass')}>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2">{t('Destination StorageClass')}</Title>
            <p>{t('Select the destination storage for the VirtualMachine storage migration.')}</p>
          </StackItem>
          <StackItem>
            <InlineFilterSelect
              options={sortedStorageClasses?.map((storageClass) => ({
                children: (
                  <>
                    <ResourceLink
                      groupVersionKind={StorageClassModelGroupVersionKind}
                      inline
                      linkTo={false}
                      name={storageClass}
                    />
                    {defaultStorageClassName === storageClass ? '(default)' : ''}
                  </>
                ),
                value: storageClass,
              }))}
              selected={destinationStorageClass}
              setSelected={setSelectedStorageClass}
              toggleProps={{ isFullWidth: true, placeholder: t('Select StorageClass') }}
            />
          </StackItem>
        </Stack>
      </WizardStep>
      <WizardStep
        footer={{
          isNextDisabled: migrationLoading,
          nextButtonText: t('Migrate VirtualMachine storage'),
        }}
        id="wizard-migrate-review"
        name={t('Review')}
      >
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2">{t('Review')}</Title>
            <p>
              <Trans t={t}>
                Verify the details and click <strong>Migrate VirtualMachine storage</strong> to
                start the migration
              </Trans>
            </p>
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
      </WizardStep>
    </Wizard>
  );
};

export default VirtualMachineMigrate;
