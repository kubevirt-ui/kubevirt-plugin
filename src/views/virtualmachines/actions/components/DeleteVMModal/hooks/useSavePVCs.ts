import { Dispatch, SetStateAction, useEffect } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

/**
 * A hook to save the PVCs from deleting with the VM by default. User can choose to delete the PVCs with the checkbox.
 * @param setPVCsToSave - The function to set the PVCs to save
 * @param pvcs - The PVCs to save
 */
const useSavePVCs = (
  setPVCsToSave: Dispatch<SetStateAction<IoK8sApiCoreV1PersistentVolumeClaim[]>>,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
) => {
  useEffect(() => {
    if (pvcs.length > 0) {
      setPVCsToSave((prevPVCs) => [...prevPVCs, ...pvcs]);
    }
  }, [setPVCsToSave, pvcs]);
};

export default useSavePVCs;
