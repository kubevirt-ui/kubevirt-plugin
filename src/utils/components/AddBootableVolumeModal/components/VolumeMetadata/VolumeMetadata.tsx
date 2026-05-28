import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { AddBootableVolumeState, SetBootableVolumeFieldType } from '../../utils/constants';

import ArchitectureSelect from './components/ArchitectureSelect/ArchitectureSelect';
import { InstanceTypeDrilldownSelect } from './components/InstanceTypeDrilldownSelect/InstanceTypeDrilldownSelect';
import PreferenceSelect from './components/PreferenceSelect/PreferenceSelect';

type VolumeMetadataProps = {
  bootableVolume: AddBootableVolumeState;
  deleteLabel: (labelKey: string) => void;
  isDisabled?: boolean;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const VolumeMetadata: FC<VolumeMetadataProps> = ({
  bootableVolume,
  deleteLabel,
  isDisabled,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();

  const { annotations } = bootableVolume || {};

  return (
    <>
      <PreferenceSelect
        bootableVolume={bootableVolume}
        deleteLabel={deleteLabel}
        isDisabled={isDisabled}
        setBootableVolumeField={setBootableVolumeField}
      />
      <InstanceTypeDrilldownSelect
        bootableVolume={bootableVolume}
        deleteLabel={deleteLabel}
        isDisabled={isDisabled}
        setBootableVolumeField={setBootableVolumeField}
      />
      <ArchitectureSelect
        bootableVolumeState={bootableVolume}
        isDisabled={isDisabled}
        setBootableVolumeField={setBootableVolumeField}
      />
      <FormGroup label={t('Description')}>
        <TextInput
          onChange={(_, value: string) =>
            setBootableVolumeField('annotations', ANNOTATIONS.description)(value)
          }
          id="description"
          isDisabled={isDisabled}
          value={annotations?.description}
        />
      </FormGroup>
    </>
  );
};

export default VolumeMetadata;
