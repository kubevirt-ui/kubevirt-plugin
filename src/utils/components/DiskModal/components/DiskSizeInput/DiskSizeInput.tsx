import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import CapacityInput from '../../../CapacityInput/CapacityInput';
import { V1DiskFormState } from '../../utils/types';
import { DISK_SIZE_FIELD } from '../utils/constants';
import { getDataVolumeTemplateSize, getPVCClaimName, getSourceRef } from '../utils/selectors';

import ExpandPVC from './ExpandPVC';
import usePVCSourceSize from './usePVCSourceSize';

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
  );

  if (isCreated) return <ExpandPVC pvc={pvc} />;

  if (isEmpty(diskState.dataVolumeTemplate) && isEmpty(pvcSize)) return null;

  return (
    <CapacityInput
      size={
        getDataVolumeTemplateSize(diskState) ||
        humanizeBinaryBytes(convertToBaseValue(pvcSize)).string
      }
      isEditingCreatedDisk={isDisabled}
      label={t('Disk size')}
      onChange={(quantity) => setValue(DISK_SIZE_FIELD, quantity)}
    />
  );
};

export default DiskSizeInput;
