import { useEffect } from 'react';

import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type StorageMigrationAPI } from '@kubevirt-utils/resources/migrations/constants';

import { getAllSelectedMigrations } from '../utils/utils';
import useMigrationModalState from './useMigrationModalState';
import useMigrationState from './useMigrationState';

type UseMigrationWizardStateParams = {
  migrationNamespacesPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  migrationNamespacesPVCsLoaded: boolean;
  storageMigAPI: StorageMigrationAPI;
  vms: V1VirtualMachine[];
};

type UseMigrationWizardStateResult = ReturnType<typeof useMigrationModalState> &
  ReturnType<typeof useMigrationState>;

const useMigrationWizardState = ({
  migrationNamespacesPVCs,
  migrationNamespacesPVCsLoaded,
  storageMigAPI,
  vms,
}: UseMigrationWizardStateParams): UseMigrationWizardStateResult => {
  const modalState = useMigrationModalState(vms);
  const {
    destinationStorageClass,
    keepOriginalVolumes,
    migrationPlanName,
    selectedMigrations,
    setSelectedMigrations,
  } = modalState;

  useEffect(() => {
    if (selectedMigrations !== null || !migrationNamespacesPVCsLoaded) return;
    setSelectedMigrations(getAllSelectedMigrations(vms, migrationNamespacesPVCs));
  }, [
    migrationNamespacesPVCs,
    migrationNamespacesPVCsLoaded,
    selectedMigrations,
    setSelectedMigrations,
    vms,
  ]);

  const migrationState = useMigrationState(
    selectedMigrations,
    destinationStorageClass,
    migrationPlanName,
    keepOriginalVolumes,
    storageMigAPI,
  );

  return { ...modalState, ...migrationState };
};

export default useMigrationWizardState;
