import React, { FC, useCallback, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sDelete, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Modal,
  ModalBody,
  Wizard,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core';

import useCreateEmptyMigPlan from './hooks/useCreateEmptyMigPlan';
import useExistingMigrationPlan from './hooks/useExistingMigrationPlan';
import useMigrationState from './hooks/useMigrationState';
import VirtualMachineMigrationDestinationTab from './tabs/VirtualMachineMigrationDestinationTab';
import VirtualMachineMigrationDetails from './tabs/VirtualMachineMigrationDetails';
import VirtualMachineMigrationReviewTab from './tabs/VirtualMachineMigrationReviewTab';
import { entireVMSelected, getMigratableVMPVCs } from './utils/utils';
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

  const migrationNamespace = getNamespace(vms?.[0]);
  const [selectedStorageClass, setSelectedStorageClass] = useState('');

  const [currentMigPlanCreation, migPlanCreationLoaded, migPlanCreationError] =
    useCreateEmptyMigPlan(migrationNamespace);

  const [existingMigPlan, migrationPlansLoaded] = useExistingMigrationPlan(
    currentMigPlanCreation,
    migrationNamespace,
  );

  const [selectedPVCs, setSelectedPVCs] = useState<IoK8sApiCoreV1PersistentVolumeClaim[] | null>(
    null,
  );

  const [namespacePVCs, loaded, loadingError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    namespace: getNamespace(vms[0]),
  });

  const vmsPVCs = useMemo(
    () => vms.map((vm) => getMigratableVMPVCs(vm, namespacePVCs)).flat(),
    [vms, namespacePVCs],
  );

  const [{ clusterDefaultStorageClass, sortedStorageClasses }, scLoaded] = useDefaultStorageClass();

  const pvcsToMigrate = useMemo(
    () => (entireVMSelected(selectedPVCs) ? vmsPVCs : selectedPVCs),
    [selectedPVCs, vmsPVCs],
  );

  const defaultStorageClassName = useMemo(
    () => getName(clusterDefaultStorageClass),
    [clusterDefaultStorageClass],
  );

  const destinationStorageClass = useMemo(
    () => selectedStorageClass || defaultStorageClassName,
    [defaultStorageClassName, selectedStorageClass],
  );

  const { migMigration, migrationError, migrationLoading, migrationStarted, onSubmit } =
    useMigrationState(
      currentMigPlanCreation,
      namespacePVCs,
      pvcsToMigrate,
      destinationStorageClass,
    );

  const nothingSelected = !entireVMSelected(selectedPVCs) && isEmpty(selectedPVCs);

  const vmStorageClassNames = useMemo(
    () => Array.from(new Set(vmsPVCs?.map((pvc) => pvc.spec.storageClassName))),
    [vmsPVCs],
  );

  const onCloseMigrationModal = useCallback(() => {
    onClose();

    if (!migrationStarted)
      k8sDelete({
        model: MigPlanModel,
        resource: currentMigPlanCreation,
      });
  }, [onClose, migrationStarted, currentMigPlanCreation]);

  const disableForExistingMigPlan = !isEmpty(existingMigPlan) || !migrationPlansLoaded;
  return (
    <Modal
      className="virtual-machine-migration-modal"
      id="virtual-machine-migration-modal"
      isOpen={isOpen}
      variant="large"
    >
      <ModalBody>
        <StateHandler error={loadingError || migPlanCreationError} loaded>
          {migrationStarted ? (
            <VirtualMachineMigrationStatus
              migMigration={migMigration}
              onClose={onCloseMigrationModal}
            />
          ) : (
            <Wizard
              header={
                <WizardHeader
                  closeButtonAriaLabel={t('Close header')}
                  description={t('Migrate VirtualMachine storage to a different StorageClass.')}
                  onClose={onCloseMigrationModal}
                  title={t('Migrate VirtualMachine storage')}
                />
              }
              onClose={onCloseMigrationModal}
              onSave={onSubmit}
              title={t('Migrate VirtualMachine storage')}
            >
              <WizardStep
                footer={{
                  isNextDisabled:
                    nothingSelected ||
                    disableForExistingMigPlan ||
                    !migPlanCreationLoaded ||
                    isEmpty(vmsPVCs),
                }}
                id="wizard-migration-details"
                name={t('Migration details')}
              >
                {!isEmpty(existingMigPlan) && (
                  <Alert
                    title={t('An existing MigPlan for this namespace was found. ')}
                    variant={AlertVariant.danger}
                  >
                    <Trans ns="plugin__kubevirt-plugin" t={t}>
                      Click{' '}
                      <Link onClick={onClose} to="/k8s/storagemigrations">
                        {t('Storage Migrations')}
                      </Link>{' '}
                      to review and delete existing MigPlans.
                    </Trans>
                  </Alert>
                )}

                {isEmpty(existingMigPlan) && loaded && scLoaded && (
                  <VirtualMachineMigrationDetails
                    pvcs={vmsPVCs}
                    selectedPVCs={selectedPVCs}
                    setSelectedPVCs={setSelectedPVCs}
                    vms={vms}
                  />
                )}

                {(!loaded || !scLoaded) && <Loading />}
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
                  pvcs={pvcsToMigrate}
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
