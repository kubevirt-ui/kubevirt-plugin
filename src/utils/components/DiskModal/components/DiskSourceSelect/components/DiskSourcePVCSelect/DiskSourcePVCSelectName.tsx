import React, { FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePVCs from '@kubevirt-utils/hooks/usePVCs';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import { diskSourcePVCNameFieldID, pvcNameField } from '../../utils/constants';

type DiskSourcePVCSelectNameProps = {
  vmNamespace?: string;
};

const DiskSourcePVCSelectName: FC<DiskSourcePVCSelectNameProps> = ({ vmNamespace }) => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext<DiskFormState>();

  const [pvcs, pvcsLoaded] = usePVCs(vmNamespace);

  const pvcNames = useMemo(() => pvcs?.map(getName), [pvcs]);

  if (!pvcsLoaded) return <Loading />;

  const error = errors?.persistentVolumeClaim?.pvcName;

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
            toggleProps={{
              isDisabled: isEmpty(vmNamespace),
              isFullWidth: true,
              placeholder: t('Select PersistentVolumeClaim'),
            }}
            selected={value as string}
            setSelected={onChange}
          />
          {error && (
            <FormGroupHelperText validated={ValidatedOptions.error}>
              {error?.message}
            </FormGroupHelperText>
          )}
        </FormGroup>
      )}
      control={control}
      name={pvcNameField}
      rules={{ required: t('PersistentVolumeClaim is required.') }}
    />
  );
};

export default DiskSourcePVCSelectName;
