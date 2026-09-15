import { type FC, useEffect } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type StorageMigrationAPI } from '@kubevirt-utils/resources/migrations/constants';
import { Wizard, WizardHeader } from '@patternfly/react-core';

import useMigrationModalState from './hooks/useMigrationModalState';
import useMigrationNamespacesPVCs from './hooks/useMigrationNamespacesPVCs';
import useMigrationState from './hooks/useMigrationState';
import { getAllSelectedMigrations } from './utils/utils';
import VirtualMachineMigrateWizardSteps from './VirtualMachineMigrateWizardSteps';
import VirtualMachineMigrationStatus from './VirtualMachineMigrationStatus';

type VirtualMachineMigrateModalWizardProps = {
  onClose: () => Promise<void> | void;
  storageMigAPI: StorageMigrationAPI;
  vms: V1VirtualMachine[];
};

const VirtualMachineMigrateModalWizard: FC<VirtualMachineMigrateModalWizardProps> = ({
  onClose,
  storageMigAPI,
  vms,
}) => {
  const { t } = useKubevirtTranslation();

  const [migrationNamespacesPVCs, migrationNamespacesPVCsLoaded, migrationNamespacesPVCsError] =
    useMigrationNamespacesPVCs(vms);

  const modalState = useMigrationModalState(vms);
  const { cluster, selectedMigrations, setSelectedMigrations } = modalState;

  useEffect(() => {
    if (selectedMigrations !== null || !migrationNamespacesPVCsLoaded) return;
    setSelectedMigrations(getAllSelectedMigrations(vms, migrationNamespacesPVCs));
  }, [
    migrationNamespacesPVCs,
    migrationNamespacesPVCsLoaded,
    vms,
    setSelectedMigrations,
    selectedMigrations,
  ]);

  const { migrationError, migrationLoading, migrationPlan, migrationStarted, onSubmit } =
    useMigrationState(
      selectedMigrations,
      modalState.destinationStorageClass,
      modalState.migrationPlanName,
      modalState.keepOriginalVolumes,
      storageMigAPI,
    );

  return (
    <StateHandler
      error={migrationNamespacesPVCsError}
      hasData
      loaded={migrationNamespacesPVCsLoaded && selectedMigrations !== null}
    >
      {migrationStarted ? (
        <VirtualMachineMigrationStatus
          cluster={cluster}
          onClose={onClose}
          storageMigAPI={storageMigAPI}
          storageMigrationPlan={migrationPlan}
        />
      ) : (
        <Wizard
          header={
            <WizardHeader
              closeButtonAriaLabel={t('Close header')}
              description={t('Migrate VirtualMachine storage to a different StorageClass.')}
              onClose={onClose}
              title={t('Migrate VirtualMachine storage')}
            />
          }
          isVisitRequired
          onClose={onClose}
          onSave={onSubmit}
          title={t('Migrate VirtualMachine storage')}
        >
          <VirtualMachineMigrateWizardSteps
            {...modalState}
            migrationError={migrationError}
            migrationLoading={migrationLoading}
            migrationNamespacesPVCs={migrationNamespacesPVCs}
            vms={vms}
          />
        </Wizard>
      )}
    </StateHandler>
  );
};

export default VirtualMachineMigrateModalWizard;
