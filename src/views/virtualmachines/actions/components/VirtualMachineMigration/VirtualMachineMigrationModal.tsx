import React, { FC, useEffect, useMemo, useState } from 'react';
import { useImmer } from 'use-immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { Modal, ModalBody, Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';

import useMigrationNamespacesPVCs from './hooks/useMigrationNamespacesPVCs';
import useMigrationState from './hooks/useMigrationState';
import VirtualMachineMigrationDestinationTab from './tabs/VirtualMachineMigrationDestinationTab';
import VirtualMachineMigrationDetails from './tabs/VirtualMachineMigrationDetails';
import VirtualMachineMigrationReviewTab from './tabs/VirtualMachineMigrationReviewTab';
import { SelectedMigration } from './utils/constants';
import { getAllSelectedMigrations } from './utils/utils';
import VirtualMachineMigrationStatus from './VirtualMachineMigrationStatus';

import './virtual-machine-migration-modal.scss';

export type VirtualMachineMigrateModalProps = {
  isOpen: boolean;
  onClose: () => Promise<void> | void;
  vms: V1VirtualMachine[];
};

const VirtualMachineMigrateModal: FC<VirtualMachineMigrateModalProps> = ({
  isOpen,
  onClose,
  vms,
}) => {
  const { t } = useKubevirtTranslation();

  const cluster = getCluster(vms?.[0]);
  const [selectedStorageClass, setSelectedStorageClass] = useState('');

  const [selectedMigrations, setSelectedMigrations] = useImmer<null | SelectedMigration[]>(null);

  const selectedPVCs = useMemo(
    () => (selectedMigrations || []).map((migration) => migration.pvc),
    [selectedMigrations],
  );

  const [migrationNamespacesPVCs, migrationNamespacesPVCsLoaded, migrationNamespacesPVCsError] =
    useMigrationNamespacesPVCs(vms);

  useEffect(() => {
    if (selectedMigrations !== null) return;
    if (!migrationNamespacesPVCsLoaded) return;

    setSelectedMigrations(getAllSelectedMigrations(vms, migrationNamespacesPVCs));
  }, [
    migrationNamespacesPVCs,
    migrationNamespacesPVCsLoaded,
    vms,
    setSelectedMigrations,
    selectedMigrations,
  ]);

  const [{ clusterDefaultStorageClass, sortedStorageClasses }, scLoaded] =
    useDefaultStorageClass(cluster);

  const defaultStorageClassName = useMemo(
    () => getName(clusterDefaultStorageClass),
    [clusterDefaultStorageClass],
  );

  const destinationStorageClass = useMemo(
    () => selectedStorageClass || defaultStorageClassName,
    [defaultStorageClassName, selectedStorageClass],
  );

  const { migrationError, migrationLoading, migrationPlan, migrationStarted, onSubmit } =
    useMigrationState(selectedMigrations, destinationStorageClass);

  const nothingSelected = isEmpty(selectedPVCs);

  const vmStorageClassNames = useMemo(
    () =>
      Array.from(
        new Set(selectedMigrations?.map((migration) => migration.pvc?.spec?.storageClassName)),
      ),
    [selectedMigrations],
  );

  return (
    <Modal
      className="virtual-machine-migration-modal"
      id="virtual-machine-migration-modal"
      isOpen={isOpen}
      variant="large"
    >
      <ModalBody>
        <StateHandler
          error={migrationNamespacesPVCsError}
          hasData
          loaded={migrationNamespacesPVCsLoaded && selectedMigrations !== null}
        >
          {migrationStarted ? (
            <VirtualMachineMigrationStatus onClose={onClose} storageMigrationPlan={migrationPlan} />
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
              onClose={onClose}
              onSave={onSubmit}
              title={t('Migrate VirtualMachine storage')}
            >
              <WizardStep
                footer={{
                  isNextDisabled: nothingSelected,
                }}
                id="wizard-migration-details"
                name={t('Migration details')}
              >
                {scLoaded && (
                  <VirtualMachineMigrationDetails
                    pvcs={migrationNamespacesPVCs || []}
                    selectedPVCs={selectedPVCs}
                    setSelectedMigrations={setSelectedMigrations}
                    vms={vms}
                  />
                )}

                {!scLoaded && <Loading />}
              </WizardStep>
              <WizardStep id="wizard-migrate-destination" name={t('Destination StorageClass')}>
                <VirtualMachineMigrationDestinationTab
                  defaultStorageClassName={defaultStorageClassName}
                  destinationStorageClass={destinationStorageClass}
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
                name={t('Review')}
              >
                <VirtualMachineMigrationReviewTab
                  defaultStorageClassName={defaultStorageClassName}
                  destinationStorageClass={destinationStorageClass}
                  migrationError={migrationError}
                  pvcs={selectedPVCs}
                  vms={vms}
                  vmStorageClassNames={vmStorageClassNames}
                />
              </WizardStep>
            </Wizard>
          )}
        </StateHandler>
      </ModalBody>
    </Modal>
  );
};

export default VirtualMachineMigrateModal;
