import { type FC, useCallback } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { type AddBootableVolumeState, type SetBootableVolumeFieldType } from '../../types';
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

  const {
    annotations,
    architectures,
    bootableVolumeCluster,
    bootableVolumeNamespace,
    labels,
    lockedPreference,
  } = bootableVolume || {};

  const setLabel = useCallback(
    (labelKey: string, value: string) => {
      setBootableVolumeField('labels', labelKey)(value);
    },
    [setBootableVolumeField],
  );

  return (
    <>
      <PreferenceSelect
        cluster={bootableVolumeCluster}
        deleteLabel={deleteLabel}
        isDisabled={isDisabled}
        labels={labels}
        lockedPreference={lockedPreference}
        namespace={bootableVolumeNamespace}
        setLabel={setLabel}
      />
      <InstanceTypeDrilldownSelect
        cluster={bootableVolumeCluster}
        deleteLabel={deleteLabel}
        isDisabled={isDisabled}
        labels={labels}
        namespace={bootableVolumeNamespace}
        setLabel={setLabel}
      />
      <ArchitectureSelect
        architectures={architectures}
        cluster={bootableVolumeCluster}
        isDisabled={isDisabled}
        onArchitecturesChange={(next) => setBootableVolumeField('architectures')(next)}
      />
      <FormGroup label={t('Description')}>
        <TextInput
          id="description"
          isDisabled={isDisabled}
          onChange={(_event, value: string) =>
            setBootableVolumeField('annotations', ANNOTATIONS.description)(value)
          }
          value={annotations?.description}
        />
      </FormGroup>
    </>
  );
};

export default VolumeMetadata;
