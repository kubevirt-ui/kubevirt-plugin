import React, { type FC, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import CapacityInput from '../../../CapacityInput/CapacityInput';
import { type V1DiskFormState } from '../../utils/types';
import { DISK_SIZE_FIELD } from '../utils/constants';
import { getPVCClaimName, getSourceRef } from '../utils/selectors';
import ExpandPVC from './ExpandPVC';
import usePVCSourceSize from './usePVCSourceSize';
import useSourceMinSize from './useSourceMinSize';
import { enforceMinDiskSize, formatMinSizeHelperText, getDiskSize, isAtMinSize } from './utils';

type DiskSizeInputProps = {
  isCreated?: boolean;
  isDisabled?: boolean;
  namespace: string;
  pvc?: IoK8sApiCoreV1PersistentVolumeClaim;
};

const DiskSizeInput: FC<DiskSizeInputProps> = ({ isCreated, isDisabled, namespace, pvc }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, watch } = useFormContext<V1DiskFormState>();
  const diskState = watch();

  const [pvcSize] = usePVCSourceSize(
    getSourceRef(diskState),
    getPVCClaimName(diskState),
    namespace,
    diskState.cluster,
  );

  const sourceMinSize = useSourceMinSize(diskState, namespace);

  const handleSizeChange = useCallback(
    (quantity: string) => setValue(DISK_SIZE_FIELD, enforceMinDiskSize(quantity, sourceMinSize)),
    [sourceMinSize, setValue],
  );

  if (isCreated && pvc) return <ExpandPVC pvc={pvc} />;

  if (isEmpty(diskState.dataVolumeTemplate) && isEmpty(pvcSize)) return null;

  const currentSize = getDiskSize(diskState, pvcSize);

  return (
    <CapacityInput
      helperText={formatMinSizeHelperText(sourceMinSize, t)}
      isEditingCreatedDisk={isDisabled}
      isMinusDisabled={isAtMinSize(currentSize, sourceMinSize)}
      label={t('Disk size')}
      onChange={handleSizeChange}
      size={currentSize}
    />
  );
};

export default DiskSizeInput;
