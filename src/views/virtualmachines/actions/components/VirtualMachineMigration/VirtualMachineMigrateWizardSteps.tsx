import { type FC } from 'react';
import { type SetStateAction } from 'react';
import { type Updater } from 'use-immer';

import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { WizardStep } from '@patternfly/react-core';

import VirtualMachineMigrationDestinationTab from './tabs/VirtualMachineMigrationDestinationTab';
import VirtualMachineMigrationDetails from './tabs/VirtualMachineMigrationDetails';
import VirtualMachineMigrationReviewTab from './tabs/VirtualMachineMigrationReviewTab';
import { type SelectedMigration } from './utils/constants';

type VirtualMachineMigrateWizardStepsProps = {
  defaultStorageClassName: string;
  destinationStorageClass: string;
  isDestinationStepInvalid: boolean;
  isDetailsStepInvalid: boolean;
  isSameStorageClass: boolean;
  keepOriginalVolumes: boolean;
  migrationError: Error | null;
  migrationLoading: boolean;
  migrationNamespacesPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  migrationPlanName: string;
  scLoaded: boolean;
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setKeepOriginalVolumes: (value: SetStateAction<boolean>) => void;
  setMigrationPlanName: (value: SetStateAction<string>) => void;
  setSelectedMigrations: Updater<null | SelectedMigration[]>;
  setSelectedStorageClass: (value: SetStateAction<string>) => void;
  sortedStorageClasses: string[] | undefined;
  vms: V1VirtualMachine[];
  vmStorageClassNames: (string | undefined)[];
};

const VirtualMachineMigrateWizardSteps: FC<VirtualMachineMigrateWizardStepsProps> = ({
  defaultStorageClassName,
  destinationStorageClass,
  isDestinationStepInvalid,
  isDetailsStepInvalid,
  isSameStorageClass,
  keepOriginalVolumes,
  migrationError,
  migrationLoading,
  migrationNamespacesPVCs,
  migrationPlanName,
  scLoaded,
  selectedPVCs,
  setKeepOriginalVolumes,
  setMigrationPlanName,
  setSelectedMigrations,
  setSelectedStorageClass,
  sortedStorageClasses,
  vms,
  vmStorageClassNames,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <WizardStep
        footer={{ isNextDisabled: isDetailsStepInvalid }}
        id="wizard-migration-details"
        name={t('Migration details')}
      >
        {scLoaded ? (
          <VirtualMachineMigrationDetails
            migrationPlanName={migrationPlanName}
            pvcs={migrationNamespacesPVCs ?? ([] as IoK8sApiCoreV1PersistentVolumeClaim[])}
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
    </>
  );
};

export default VirtualMachineMigrateWizardSteps;
