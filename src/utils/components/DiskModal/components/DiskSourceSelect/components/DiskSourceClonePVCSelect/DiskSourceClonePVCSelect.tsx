import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { type V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import PVCClonePermissionAlert from '@kubevirt-utils/components/PVCClonePermissionAlert/PVCClonePermissionAlert';
import type { PVCClonePermissionState } from '@kubevirt-utils/hooks/useCanClonePVCFromNamespace';

import { DATAVOLUME_PVC_NAMESPACE } from '../../../utils/constants';
import DiskSourceClonePVCSelectName from './DiskSourceClonePVCSelectName';
import DiskSourceClonePVCSelectNamespace from './DiskSourceClonePVCSelectNamespace';

type DiskSourceClonePVCSelectProps = {
  clonePermission: PVCClonePermissionState;
};

const DiskSourceClonePVCSelect: FC<DiskSourceClonePVCSelectProps> = ({ clonePermission }) => {
  const { watch } = useFormContext<V1DiskFormState>();
  const sourceNamespace = watch(DATAVOLUME_PVC_NAMESPACE);
  const { canClone, isChecking, requiresClonePermission } = clonePermission;

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
