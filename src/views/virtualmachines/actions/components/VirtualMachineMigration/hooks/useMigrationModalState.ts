import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { type Updater, useImmer } from 'use-immer';

import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isDNS1123Label } from '@kubevirt-utils/utils/validation';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { type SelectedMigration } from '../utils/constants';
import { generateMigPlanName } from '../utils/shared';
import { getIsSameStorageClass, getVmStorageClassNames } from '../utils/storageClassUtils';
import useMigrationStorageClass from './useMigrationStorageClass';

type UseMigrationModalStateResult = {
  cluster: string | undefined;
  defaultStorageClassName: string;
  destinationStorageClass: string;
  isDestinationStepInvalid: boolean;
  isDetailsStepInvalid: boolean;
  isSameStorageClass: boolean;
  keepOriginalVolumes: boolean;
  migrationPlanName: string;
  scLoaded: boolean;
  selectedMigrations: null | SelectedMigration[];
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setKeepOriginalVolumes: Dispatch<SetStateAction<boolean>>;
  setMigrationPlanName: Dispatch<SetStateAction<string>>;
  setSelectedMigrations: Updater<null | SelectedMigration[]>;
  setSelectedStorageClass: Dispatch<SetStateAction<string>>;
  sortedStorageClasses: string[] | undefined;
  vmStorageClassNames: (string | undefined)[];
};

const useMigrationModalState = (vms: V1VirtualMachine[]): UseMigrationModalStateResult => {
  const clusterParam = useClusterParam();
  const cluster = getCluster(vms?.[0]) ?? clusterParam ?? undefined;

  const [migrationPlanName, setMigrationPlanName] = useState(() => generateMigPlanName(vms));
  const [keepOriginalVolumes, setKeepOriginalVolumes] = useState(false);
  const [selectedMigrations, setSelectedMigrations] = useImmer<null | SelectedMigration[]>(null);

  const selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[] = useMemo(
    () => (selectedMigrations ?? []).map((migration) => migration.pvc),
    [selectedMigrations],
  );

  const {
    defaultStorageClassName,
    destinationStorageClass,
    scLoaded,
    setSelectedStorageClass,
    sortedStorageClasses,
  } = useMigrationStorageClass(cluster);

  const vmStorageClassNames = useMemo(
    () => getVmStorageClassNames(selectedMigrations, defaultStorageClassName),
    [defaultStorageClassName, selectedMigrations],
  );

  const isSameStorageClass = useMemo(
    () => getIsSameStorageClass(destinationStorageClass, vmStorageClassNames),
    [destinationStorageClass, vmStorageClassNames],
  );

  const nothingSelected = isEmpty(selectedPVCs);
  const isDetailsStepInvalid =
    nothingSelected || !migrationPlanName || !isDNS1123Label(migrationPlanName);
  const isDestinationStepInvalid = isDetailsStepInvalid || isSameStorageClass;

  return {
    cluster,
    defaultStorageClassName,
    destinationStorageClass,
    isDestinationStepInvalid,
    isDetailsStepInvalid,
    isSameStorageClass,
    keepOriginalVolumes,
    migrationPlanName,
    scLoaded,
    selectedMigrations,
    selectedPVCs,
    setKeepOriginalVolumes,
    setMigrationPlanName,
    setSelectedMigrations,
    setSelectedStorageClass,
    sortedStorageClasses,
    vmStorageClassNames,
  };
};

export default useMigrationModalState;
