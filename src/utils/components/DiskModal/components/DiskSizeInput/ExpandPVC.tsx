import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';

import { V1DiskFormState } from '../../utils/types';
import { EXPAND_PVC_SIZE } from '../utils/constants';

type ExpandPVCProps = { pvc: IoK8sApiCoreV1PersistentVolumeClaim };

const ExpandPVC: FC<ExpandPVCProps> = ({ pvc }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, watch } = useFormContext<V1DiskFormState>();
  const diskState = watch();

  const expandPVCSize = diskState.expandPVCSize;

  const pvcSize = pvc?.spec?.resources?.requests?.storage;

  const onQuantityChange = (quantity: string) => {
    const newQuantityValue = convertToBaseValue(quantity)?.toString();

    setValue(EXPAND_PVC_SIZE, newQuantityValue > pvcSize ? quantity : null);
  };

  if (!pvcSize) return null;

  const size = expandPVCSize || humanizeBinaryBytes(convertToBaseValue(pvcSize)).string;

  const isMinusDisabled = pvcSize === convertToBaseValue(expandPVCSize) || !expandPVCSize;

  return (
    <CapacityInput
      isMinusDisabled={isMinusDisabled}
      label={t('PersistentVolumeClaim size')}
      onChange={onQuantityChange}
      size={size}
    />
  );
};

export default ExpandPVC;
