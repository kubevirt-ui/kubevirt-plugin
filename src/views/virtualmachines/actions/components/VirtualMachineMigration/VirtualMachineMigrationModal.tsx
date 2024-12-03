import React, { FC, useMemo, useState } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import useDisksSources from '@kubevirt-utils/resources/vm/hooks/disk/useDisksSources';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Modal, Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';

import VirtualMachineMigrationDestinationTab from './tabs/VirtualMachineMigrationDestinationTab';
import VirtualMachineMigrationDetails from './tabs/VirtualMachineMigrationDetails';
import VirtualMachineMigrationReviewTab from './tabs/VirtualMachineMigrationReviewTab';
import { entireVMSelected, migrateVM } from './utils';

import './virtual-machine-migration-modal.scss';

export type VirtualMachineMigrateModalProps = {
  isOpen: boolean;
  onClose: () => Promise<void> | void;
  vm: V1VirtualMachine;
};

const VirtualMachineMigrateModal: FC<VirtualMachineMigrateModalProps> = ({
  isOpen,
  onClose,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const [selectedStorageClass, setSelectedStorageClass] = useState('');
  const [migrationError, setMigrationError] = useState<Error | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [selectedPVCs, setSelectedPVCs] = useState<IoK8sApiCoreV1PersistentVolumeClaim[] | null>(
    null,
  );

  const { loaded, loadingError, pvcs } = useDisksSources(vm);

  const [{ clusterDefaultStorageClass, sortedStorageClasses }, scLoaded] = useDefaultStorageClass();

  const pvcsToMigrate = entireVMSelected(selectedPVCs) ? pvcs : selectedPVCs;

  const defaultStorageClassName = useMemo(
    () => getName(clusterDefaultStorageClass),
    [clusterDefaultStorageClass],
  );

  const destinationStorageClass = useMemo(
    () => selectedStorageClass || defaultStorageClassName,
    [defaultStorageClassName, selectedStorageClass],
  );

  const onSubmit = async () => {
    setMigrationLoading(true);
    setMigrationError(null);
    try {
      await migrateVM(vm, pvcsToMigrate, destinationStorageClass);

      onClose();
    } catch (apiError) {
      setMigrationError(apiError);
    }

    setMigrationLoading(false);
  };

  const nothingSelected = !entireVMSelected(selectedPVCs) && isEmpty(selectedPVCs);

  return (
    <Modal
      className="virtual-machine-migration-modal"
      id="virtual-machine-migration-modal"
      isOpen={isOpen}
      showClose={false}
      variant="large"
    >
      <StateHandler error={loadingError} loaded>
        <Wizard
          header={
            <WizardHeader
              closeButtonAriaLabel={t('Close header')}
              description={t('Migrate VirtualMachine storage to a different StorageClass.')}
              onClose={onClose}
              title={t('Migrate VirtualMachine storage')}
            />
          }
          onSave={onSubmit}
          title={t('Migrate VirtualMachine storage')}
        >
          <WizardStep
            footer={{ isNextDisabled: nothingSelected }}
            id="wizard-migration-details"
            name={t('Migration details')}
          >
            {loaded && scLoaded ? (
              <VirtualMachineMigrationDetails
                pvcs={pvcs}
                selectedPVCs={selectedPVCs}
                setSelectedPVCs={setSelectedPVCs}
                vm={vm}
              />
            ) : (
              <Loading />
            )}
          </WizardStep>
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
              pvcs={pvcsToMigrate}
              vm={vm}
            />
          </WizardStep>
        </Wizard>
      </StateHandler>
    </Modal>
  );
};

export default VirtualMachineMigrateModal;
