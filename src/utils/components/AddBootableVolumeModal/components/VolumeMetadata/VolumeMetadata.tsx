import { type FC } from 'react';

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
