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
  setBootableVolumeField: (key: string, fieldKey?: string) => (value: string) => void;
  preferencesNames: string[];
};

const VolumeMetadata: FC<VolumeMetadataProps> = ({
  bootableVolume,
  setBootableVolumeField,
  preferencesNames,
}) => {
  const { t } = useKubevirtTranslation();

  const { labels, annotations } = bootableVolume || {};

  return (
    <>
      <PreferenceSelect
        selectedPreference={labels?.[DEFAULT_PREFERENCE_LABEL]}
        setBootableVolumeField={setBootableVolumeField}
        preferencesNames={preferencesNames}
      />

      <InstanceTypeDrilldownSelect
        selected={labels?.[DEFAULT_INSTANCETYPE_LABEL]}
        setSelected={setBootableVolumeField('labels', DEFAULT_INSTANCETYPE_LABEL)}
      />
      <FormGroup label={t('Description')}>
        <TextInput
          id="description"
          value={annotations?.description}
          onChange={setBootableVolumeField('annotations', ANNOTATIONS.description)}
        />
      </FormGroup>
    </>
  );
};

export default VolumeMetadata;
