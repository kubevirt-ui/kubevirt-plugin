import React, { FC, useCallback, useMemo, useState } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty, removeDuplicates } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import { Modal, ModalBody, Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';
import VirtualMachineMigrationDestinationTab from '@virtualmachines/actions/components/VirtualMachineMigration/components/tabs/VirtualMachineMigrationDestinationTab';
import VirtualMachineMigrationReviewTab from '@virtualmachines/actions/components/VirtualMachineMigration/components/tabs/VirtualMachineMigrationReviewTab';
import VMMigrationNamespaceConflictsAlert from '@virtualmachines/actions/components/VirtualMachineMigration/components/VMMigrationNamespaceConflictsAlert';
import useMigrationNamespacesPVCs from '@virtualmachines/actions/components/VirtualMachineMigration/hooks/useMigrationNamespacesPVCs';

import VirtualMachineMigrationStatus from './components/VirtualMachineMigrationStatus';
import useCreateEmptyMigPlan from './hooks/useCreateEmptyMigPlan';
import useExistingMigPlanConflicts from './hooks/useExistingMigPlanConflicts';
import useMigrationState from './hooks/useMigrationState';
import { entireVMSelected, getMigratableVMPVCs } from './utils/utils';

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
  const vmNamespaces = removeDuplicates(vms?.map((vm) => getNamespace(vm)));
  const vmClusters = removeDuplicates(vms?.map((vm) => getCluster(vm)));

  const cluster = getCluster(vms?.[0]);
  const [selectedStorageClass, setSelectedStorageClass] = useState('');

  const [currentMigPlanCreation, migPlanCreationLoaded, migPlanCreationError] =
    useCreateEmptyMigPlan(vmNamespaces, cluster);

  const { migPlansLoaded, migPlansLoadError, namespaceConflicts } = useExistingMigPlanConflicts(
    currentMigPlanCreation,
    vmNamespaces,
    cluster,
  );

  const [selectedPVCs, setSelectedPVCs] = useState<IoK8sApiCoreV1PersistentVolumeClaim[] | null>(
    null,
  );

  const [pvcsInNamespaces, loaded, pvcsLoadError] = useMigrationNamespacesPVCs(vmNamespaces);

  const vmsPVCs = useMemo(
    () => vms.map((vm) => getMigratableVMPVCs(vm, pvcsInNamespaces)).flat(),
    [vms, pvcsInNamespaces],
  );

  const [{ clusterDefaultStorageClass, sortedStorageClasses }, scLoaded] =
    useDefaultStorageClass(cluster);

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
      pvcsInNamespaces,
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

  // TODO Does the cluster the VMs are on have to be the same as the cluster passed to create the migplan?
  const disableForExistingMigPlan =
    !isEmpty(namespaceConflicts) || vmClusters.length > 1 || !migPlansLoaded;

  return (
    <Modal
      className="virtual-machine-migration-modal"
      id="virtual-machine-migration-modal"
      isOpen={isOpen}
      variant="large"
    >
      <ModalBody>
        <StateHandler
          error={pvcsLoadError || migPlansLoadError || migPlanCreationError}
          hasData
          loaded
        >
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
                <VMMigrationNamespaceConflictsAlert
                  loaded={loaded}
                  namespaceConflicts={namespaceConflicts}
                  onClose={onClose}
                  scLoaded={scLoaded}
                  selectedPVCs={selectedPVCs}
                  setSelectedPVCs={setSelectedPVCs}
                  vms={vms}
                  vmsPVCs={vmsPVCs}
                />
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
