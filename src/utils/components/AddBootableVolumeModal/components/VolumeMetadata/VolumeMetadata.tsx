import React, { FC } from 'react';

import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { AddBootableVolumeState } from '../../utils/constants';

import { InstanceTypeDrilldownSelect } from './components/InstanceTypeDrilldownSelect/InstanceTypeDrilldownSelect';
import PreferenceSelect from './components/PreferenceSelect/PreferenceSelect';

type VolumeMetadataProps = {
  bootableVolume: AddBootableVolumeState;
  preferencesNames: string[];
  setBootableVolumeField: (key: string, fieldKey?: string) => (value: string) => void;
};

const VolumeMetadata: FC<VolumeMetadataProps> = ({
  bootableVolume,
  preferencesNames,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();

  const { annotations, labels } = bootableVolume || {};

  return (
    <>
      <PreferenceSelect
        preferencesNames={preferencesNames}
        selectedPreference={labels?.[DEFAULT_PREFERENCE_LABEL]}
        setBootableVolumeField={setBootableVolumeField}
      />

      <InstanceTypeDrilldownSelect
        selected={labels?.[DEFAULT_INSTANCETYPE_LABEL]}
        setSelected={setBootableVolumeField('labels', DEFAULT_INSTANCETYPE_LABEL)}
      />
      <FormGroup label={t('Description')}>
        <TextInput
          id="description"
          onChange={setBootableVolumeField('annotations', ANNOTATIONS.description)}
          value={annotations?.description}
        />
      </FormGroup>
    </>
  );
};

export default VolumeMetadata;
