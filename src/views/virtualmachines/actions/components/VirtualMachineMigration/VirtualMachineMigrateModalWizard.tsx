import { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type StorageMigrationAPI } from '@kubevirt-utils/resources/migrations/constants';
import { Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';

import useMigrationNamespacesPVCs from './hooks/useMigrationNamespacesPVCs';
import useMigrationWizardState from './hooks/useMigrationWizardState';
import VirtualMachineMigrationDestinationTab from './tabs/VirtualMachineMigrationDestinationTab';
import VirtualMachineMigrationDetails from './tabs/VirtualMachineMigrationDetails';
import VirtualMachineMigrationReviewTab from './tabs/VirtualMachineMigrationReviewTab';
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

  const {
    cluster,
    defaultStorageClassName,
    destinationStorageClass,
    isDestinationStepInvalid,
    isDetailsStepInvalid,
    isSameStorageClass,
    keepOriginalVolumes,
    migrationError,
    migrationLoading,
    migrationPlan,
    migrationPlanName,
    migrationStarted,
    onSubmit,
    scLoaded,
    selectedMigrations,
    selectedPVCs,
    setKeepOriginalVolumes,
    setMigrationPlanName,
    setSelectedMigrations,
    setSelectedStorageClass,
    sortedStorageClasses,
    vmStorageClassNames,
  } = useMigrationWizardState({
    migrationNamespacesPVCs,
    migrationNamespacesPVCsLoaded,
    storageMigAPI,
    vms,
  });

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
          <WizardStep
            footer={{ isNextDisabled: isDetailsStepInvalid }}
            id="wizard-migration-details"
            name={t('Migration details')}
          >
            {scLoaded ? (
              <VirtualMachineMigrationDetails
                migrationPlanName={migrationPlanName}
                pvcs={migrationNamespacesPVCs ?? []}
                selectedPVCs={selectedPVCs}
                setMigrationPlanName={setMigrationPlanName}
                setSelectedMigrations={setSelectedMigrations}
                vms={vms}
              />
            ) : (
              <Loading />
            )}
          </WizardStep>
          <WizardStep
            footer={{ isNextDisabled: isDestinationStepInvalid }}
            id="wizard-migrate-destination"
            isDisabled={isDetailsStepInvalid}
            name={t('Source and target StorageClass')}
          >
            <VirtualMachineMigrationDestinationTab
              defaultStorageClassName={defaultStorageClassName}
              destinationStorageClass={destinationStorageClass}
              isSameStorageClass={isSameStorageClass}
              keepOriginalVolumes={keepOriginalVolumes}
              setKeepOriginalVolumes={setKeepOriginalVolumes}
              setSelectedStorageClass={setSelectedStorageClass}
              sortedStorageClasses={sortedStorageClasses}
              vmStorageClassNames={vmStorageClassNames}
            />
          </WizardStep>
          <WizardStep
            footer={{
              isNextDisabled: migrationLoading,
              nextButtonProps: { isLoading: migrationLoading },
              nextButtonText: t('Migrate VirtualMachine storage'),
            }}
            id="wizard-migrate-review"
            isDisabled={isDestinationStepInvalid}
            name={t('Review')}
          >
            <VirtualMachineMigrationReviewTab
              defaultStorageClassName={defaultStorageClassName}
              destinationStorageClass={destinationStorageClass}
              keepOriginalVolumes={keepOriginalVolumes}
              migrationError={migrationError}
              migrationPlanName={migrationPlanName}
              pvcs={selectedPVCs}
              vms={vms}
              vmStorageClassNames={vmStorageClassNames}
            />
          </WizardStep>
        </Wizard>
      )}
    </StateHandler>
  );
};

export default VirtualMachineMigrateModalWizard;
