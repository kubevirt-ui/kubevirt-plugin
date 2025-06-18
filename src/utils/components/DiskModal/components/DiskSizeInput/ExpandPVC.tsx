import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { toQuantity } from '@kubevirt-utils/utils/units';

import { V1DiskFormState } from '../../utils/types';
import { EXPAND_PVC_SIZE } from '../utils/constants';

import { getMinSizes } from './utils';

type ExpandPVCProps = { pvc: IoK8sApiCoreV1PersistentVolumeClaim };

const ExpandPVC: FC<ExpandPVCProps> = ({ pvc }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, watch } = useFormContext<V1DiskFormState>();
  const diskState = watch();

  const expandPVCSize = diskState.expandPVCSize;

  const pvcSize = pvc?.spec?.resources?.requests?.storage;

  const onQuantityChange = (quantity: string) => {
    setValue(EXPAND_PVC_SIZE, quantity);
  };

  if (!pvcSize) return null;

  const size = expandPVCSize ?? pvcSize;
  const { unit, value } = toQuantity(size);

  const minSizes = getMinSizes(pvcSize);
  const minSize = minSizes[unit];
  const isMinusDisabled = Math.ceil(minSize) >= value;

  return (
    <CapacityInput
      isMinusDisabled={isMinusDisabled}
      label={t('PersistentVolumeClaim size')}
      minValue={minSize}
      onChange={onQuantityChange}
      size={size}
    />
  );
};

export default ExpandPVC;
