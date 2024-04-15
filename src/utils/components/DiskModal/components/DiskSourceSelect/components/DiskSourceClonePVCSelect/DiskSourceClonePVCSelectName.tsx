import React, { FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { bytesToDiskSize } from '@catalog/utils/quantity';
import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { removeByteSuffix } from '@kubevirt-utils/components/CapacityInput/utils';
import { DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePVCs from '@kubevirt-utils/hooks/usePVCs';
import { convertResourceArrayToMap, getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import { diskSizeField } from '../../../utils/constants';
import {
  clonePVCNameField,
  clonePVCNamespaceField,
  diskSourcePVCNameFieldID,
} from '../../utils/constants';

const DiskSourceClonePVCSelectName: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<DiskFormState>();

  const namespace = watch(clonePVCNamespaceField);

  const [pvcs, pvcsLoaded] = usePVCs(namespace);

  const pvcNames = useMemo(() => pvcs?.map(getName), [pvcs]);

  const pvcMapper = convertResourceArrayToMap(pvcs);
  if (!pvcsLoaded) return <Loading />;

  const error = errors?.pvc?.pvcName;

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
              setValue(diskSizeField, removeByteSuffix(bytesToDiskSize(selectedPVCSize)));
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
      name={clonePVCNameField}
    />
  );
};

export default DiskSourceClonePVCSelectName;
