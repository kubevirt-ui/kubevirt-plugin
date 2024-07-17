import React, { FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { bytesToDiskSize } from '@catalog/utils/quantity';
import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { removeByteSuffix } from '@kubevirt-utils/components/CapacityInput/utils';
import { V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePVCs from '@kubevirt-utils/hooks/usePVCs';
import { convertResourceArrayToMap, getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import {
  DATAVOLUME_PVC_NAME,
  DATAVOLUME_PVC_NAMESPACE,
  DISK_SIZE_FIELD,
} from '../../../utils/constants';
import { getErrorPVCName } from '../../../utils/selectors';
import { diskSourcePVCNameFieldID } from '../../utils/constants';

const DiskSourceClonePVCSelectName: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<V1DiskFormState>();

  const namespace = watch(DATAVOLUME_PVC_NAMESPACE);

  const [pvcs, pvcsLoaded] = usePVCs(namespace);

  const pvcNames = useMemo(() => pvcs?.map(getName), [pvcs]);

  const pvcMapper = convertResourceArrayToMap(pvcs);
  if (!pvcsLoaded) return <Loading />;

  const error = getErrorPVCName(errors);

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <FormGroup
          fieldId={diskSourcePVCNameFieldID}
          id={diskSourcePVCNameFieldID}
          isRequired
          label={t('PersistentVolumeClaim name')}
        >
          <InlineFilterSelect
            options={pvcNames?.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
              value: name,
            }))}
            setSelected={(pvcName) => {
              onChange(pvcName);
              const selectedPVC = pvcMapper[pvcName];
              const selectedPVCSize = selectedPVC?.spec?.resources?.requests?.storage;
              setValue(DISK_SIZE_FIELD, removeByteSuffix(bytesToDiskSize(selectedPVCSize)));
            }}
            toggleProps={{
              isDisabled: isEmpty(namespace),
              isFullWidth: true,
              placeholder: t('Select PersistentVolumeClaim'),
            }}
            selected={value}
          />
          {error && (
            <FormGroupHelperText validated={ValidatedOptions.error}>
              {error?.message}
            </FormGroupHelperText>
          )}
        </FormGroup>
      )}
      rules={{
        required: t('PersistentVolumeClaim is required.'),
      }}
      control={control}
      name={DATAVOLUME_PVC_NAME}
    />
  );
};

export default DiskSourceClonePVCSelectName;
