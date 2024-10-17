import React, { FC, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom-v5-compat';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getResourceUrl } from '@kubevirt-utils/resources/shared';
import useDisksSources from '@kubevirt-utils/resources/vm/hooks/disk/useDisksSources';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Bullseye,
  Wizard,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core';

import VirtualMachineMigrationDestinationTab from './tabs/VirtualMachineMigrationDestinationTab';
import VirtualMachineMigrationReviewTab from './tabs/VirtualMachineMigrationReviewTab';
import { migrateVM } from './utils';

const VirtualMachineMigrate: FC = () => {
  const { t } = useKubevirtTranslation();

  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const [selectedStorageClass, setSelectedStorageClass] = useState('');
  const [migrationError, setMigrationError] = useState<Error | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  const defaultStorageClassName = useMemo(
    () => getName(clusterDefaultStorageClass),
    [clusterDefaultStorageClass],
  );

  const destinationStorageClass = useMemo(
    () => selectedStorageClass || defaultStorageClassName,
    [defaultStorageClassName, selectedStorageClass],
  );

  const goBack = useCallback(() => {
    const fromUrl = searchParams.get('fromURL');
    if (isEmpty(fromUrl)) {
      navigate(`${getResourceUrl({ model: VirtualMachineModel, resource: vm })}`);
      return;
    }

    navigate(fromUrl);
  }, [searchParams, navigate, vm]);

  const onSubmit = async () => {
    setMigrationLoading(true);
    setMigrationError(null);
    try {
      await migrateVM(vm, pvcs, destinationStorageClass);

      goBack();
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
      onClose={goBack}
      onSave={onSubmit}
      title={t('Migrate VirtualMachine storage')}
    >
      <WizardStep id="wizard-migrate-destination" name={t('Destination StorageClass')}>
        <VirtualMachineMigrationDestinationTab
          defaultStorageClassName={defaultStorageClassName}
          destinationStorageClass={destinationStorageClass}
          setSelectedStorageClass={setSelectedStorageClass}
          sortedStorageClasses={sortedStorageClasses}
        />
      </WizardStep>
      <WizardStep
        footer={{
          isNextDisabled: migrationLoading,
          nextButtonText: t('Migrate VirtualMachine storage'),
        }}
        id="wizard-migrate-review"
        name={t('Review')}
      >
        <VirtualMachineMigrationReviewTab
          defaultStorageClassName={defaultStorageClassName}
          destinationStorageClass={destinationStorageClass}
          migrationError={migrationError}
        />
      </WizardStep>
    </Wizard>
  );
};

export default VirtualMachineMigrate;
