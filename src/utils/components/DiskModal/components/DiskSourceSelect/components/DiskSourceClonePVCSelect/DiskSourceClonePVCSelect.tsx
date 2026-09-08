import React, { type FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { type V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import PVCClonePermissionAlert from '@kubevirt-utils/components/PVCClonePermissionAlert/PVCClonePermissionAlert';
import useCanClonePVCFromNamespace from '@kubevirt-utils/hooks/useCanClonePVCFromNamespace';

import { DATAVOLUME_PVC_NAMESPACE, VM_CLUSTER_FIELD } from '../../../utils/constants';
import DiskSourceClonePVCSelectName from './DiskSourceClonePVCSelectName';
import DiskSourceClonePVCSelectNamespace from './DiskSourceClonePVCSelectNamespace';

type DiskSourceClonePVCSelectProps = {
  destinationNamespace: string;
};

const DiskSourceClonePVCSelect: FC<DiskSourceClonePVCSelectProps> = ({ destinationNamespace }) => {
  const { watch } = useFormContext<V1DiskFormState>();
  const vmCluster = watch(VM_CLUSTER_FIELD);
  const sourceNamespace = watch(DATAVOLUME_PVC_NAMESPACE);

  const { canClone, isChecking, requiresClonePermission } = useCanClonePVCFromNamespace(
    sourceNamespace,
    destinationNamespace,
    vmCluster,
  );

  const showClonePermissionError =
    requiresClonePermission && !isChecking && !canClone && Boolean(sourceNamespace);

  return (
    <>
      <DiskSourceClonePVCSelectNamespace />
      <DiskSourceClonePVCSelectName />
      {showClonePermissionError && <PVCClonePermissionAlert sourceNamespace={sourceNamespace} />}
    </>
  );
};

export default DiskSourceClonePVCSelect;
