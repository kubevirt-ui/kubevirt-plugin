import React, { Dispatch, FC, SetStateAction } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

type DiskSourcePVCSelectNameProps = {
  isDisabled?: boolean;
  onChange: Dispatch<SetStateAction<string>>;
  pvcNames: string[];
  pvcNameSelected: string;
  pvcsLoaded: boolean;
};

const DiskSourcePVCSelectName: FC<DiskSourcePVCSelectNameProps> = ({
  isDisabled,
  onChange,
  pvcNames,
  pvcNameSelected,
  pvcsLoaded,
}) => {
  const { t } = useKubevirtTranslation();

  const fieldId = 'pvc-name-select';

  return (
    <FormGroup fieldId={fieldId} id={fieldId} isRequired label={t('PVC name')}>
      {pvcsLoaded ? (
        <InlineFilterSelect
          options={pvcNames?.map((name) => ({
            children: name,
            groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
            value: name,
          }))}
          selected={pvcNameSelected}
          setSelected={onChange}
          toggleProps={{ isDisabled, isFullWidth: true, placeholder: t('--- Select PVC name ---') }}
        />
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default DiskSourcePVCSelectName;
