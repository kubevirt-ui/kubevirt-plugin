import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getSharedDataVolumes } from '../utils/helpers';

/**
 * A hook to save the shared data volumes from deleting with the VM by default. User can choose to delete the shared data volumes with the checkbox.
 * @param vm - The virtual machine
 * @param setVolumesToSave - The function to set the volumes to save
 * @param dataVolumes - The data volumes connected with the VM
 */
const useSaveSharedDisks = (
  sharedVolumes: V1Volume[],
  setVolumesToSave: Dispatch<
    SetStateAction<(IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume)[]>
  >,
  dataVolumes: V1beta1DataVolume[],
) => {
  const sharedDataVolumes = useMemo(
    () => getSharedDataVolumes(sharedVolumes, dataVolumes),
    [sharedVolumes, dataVolumes],
  );

  useEffect(() => {
    if (sharedDataVolumes) {
      setVolumesToSave((prevVolumes) => [...prevVolumes, ...sharedDataVolumes]);
    }
  }, [setVolumesToSave, sharedDataVolumes]);
};

export default useSaveSharedDisks;
