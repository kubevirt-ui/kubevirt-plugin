import React, { FC } from 'react';

import FilterSelect from '@kubevirt-utils/components/FilterSelect/FilterSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Skeleton } from '@patternfly/react-core';

type PersistentVolumeSelectNameProps = {
  isDisabled: boolean;
  isLoading?: boolean;
  onChange: (newPVCName: string) => void;
  pvcNames: string[];
  pvcNameSelected: string;
};

export const PersistentVolumeSelectName: FC<PersistentVolumeSelectNameProps> = ({
  isDisabled,
  isLoading,
  onChange,
  pvcNames,
  pvcNameSelected,
}) => {
  const { t } = useKubevirtTranslation();

  const fieldId = 'pvc-name-select';

  if (isLoading) {
    return (
      <>
        <br />
        <Skeleton className="pvc-selection-formgroup" fontSize="lg" />
        <br />
      </>
    );
  }

  return (
    <FormGroup
      className="pvc-selection-formgroup"
      fieldId={fieldId}
      id={fieldId}
      isRequired
      label={t('PVC name')}
    >
      <FilterSelect
        options={pvcNames?.map((name) => ({
          children: name,
          value: name,
        }))}
        toggleProps={{
          isDisabled,
          isFullHeight: true,
          placeholder: t('--- Select PVC name ---'),
        }}
        selected={pvcNameSelected}
        setSelected={onChange}
      />
    </FormGroup>
  );
};
