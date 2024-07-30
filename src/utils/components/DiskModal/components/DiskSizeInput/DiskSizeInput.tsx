import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';

import CapacityInput from '../../../CapacityInput/CapacityInput';
import { V1DiskFormState } from '../../utils/types';
import { DISK_SIZE_FIELD } from '../utils/constants';
import { getDataVolumeTemplateSize, getPVCClaimName, getSourceRef } from '../utils/selectors';

import usePVCSourceSize from './usePVCSourceSize';

type DiskSizeInputProps = { isCreated: boolean; namespace: string };

const DiskSizeInput: FC<DiskSizeInputProps> = ({ isCreated, namespace }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, watch } = useFormContext<V1DiskFormState>();
  const diskState = watch();

  const [pvcSize] = usePVCSourceSize(
    getSourceRef(diskState),
    getPVCClaimName(diskState),
    namespace,
  );

  return (
    <CapacityInput
      size={
        getDataVolumeTemplateSize(diskState) ||
        humanizeBinaryBytes(convertToBaseValue(pvcSize)).string
      }
      isEditingCreatedDisk={isCreated}
      label={t('Disk size')}
      onChange={(quantity) => setValue(DISK_SIZE_FIELD, quantity)}
    />
  );
};

export default DiskSizeInput;
