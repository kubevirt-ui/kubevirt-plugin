import React, { type FC, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getPVCSize } from '@kubevirt-utils/resources/bootableresources/selectors';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { formatQuantityString } from '@kubevirt-utils/utils/units';

import { type V1DiskFormState } from '../../utils/types';
import { EXPAND_PVC_SIZE } from '../utils/constants';
import useSourceMinSize from './useSourceMinSize';
import { enforceMinDiskSize, formatMinSizeHelperText, isAtMinSize } from './utils';

type ExpandPVCProps = { pvc: IoK8sApiCoreV1PersistentVolumeClaim };

const ExpandPVC: FC<ExpandPVCProps> = ({ pvc }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, watch } = useFormContext<V1DiskFormState>();
  const diskState = watch();

  const pvcSize = getPVCSize(pvc);
  const pvcStorage = pvcSize ? (formatQuantityString(pvcSize) ?? undefined) : undefined;
  const sourceMinSize = useSourceMinSize(diskState, getNamespace(pvc) ?? '');
  const size = diskState.expandPVCSize ?? pvcStorage ?? '';

  const handleSizeChange = useCallback(
    (quantity: string) => setValue(EXPAND_PVC_SIZE, enforceMinDiskSize(quantity, sourceMinSize)),
    [sourceMinSize, setValue],
  );

  if (!pvcStorage) {
    return null;
  }

  return (
    <CapacityInput
      helperText={formatMinSizeHelperText(sourceMinSize, t)}
      isMinusDisabled={isAtMinSize(size, sourceMinSize)}
      label={t('PersistentVolumeClaim size')}
      onChange={handleSizeChange}
      size={size}
    />
  );
};

export default ExpandPVC;
