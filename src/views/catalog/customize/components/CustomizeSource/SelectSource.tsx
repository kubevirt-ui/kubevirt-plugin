import * as React from 'react';

import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { PersistentVolumeClaimSelect } from '../PersistentVolumeClaimSelect';

import {
  BLANK_SOURCE_NAME,
  CONTAINER_DISK_SOURCE_NAME,
  DEFAULT_SOURCE,
  HTTP_SOURCE_NAME,
  PVC_SOURCE_NAME,
  REGISTRY_SOURCE_NAME,
  SOURCE_OPTIONS_IDS,
} from './constants';
import SelectSourceOption from './SelectSourceOption';
import { appendDockerPrefix, getGenericSourceCustomization, getPVCSource } from './utils';
import { VolumeSize } from './VolumeSize';

export type SelectSourceProps = {
  onSourceChange: (customSource: V1beta1DataVolumeSpec) => void;
  sourceLabel: React.ReactNode;
  initialVolumeQuantity?: string;
  withSize?: boolean;
  sourceOptions: SOURCE_OPTIONS_IDS[];
  httpSourceHelperText?: string;
  registrySourceHelperText?: string;
};

export const SelectSource: React.FC<SelectSourceProps> = ({
  onSourceChange,
  initialVolumeQuantity = '30Gi',
  withSize = false,
  sourceOptions,
  sourceLabel,
  httpSourceHelperText,
  registrySourceHelperText,
}) => {
  const { t } = useKubevirtTranslation();
  const [volumeQuantity, setVolumeQuantity] = React.useState(initialVolumeQuantity);

  const [selectedSourceType, setSourceType] = React.useState<SOURCE_OPTIONS_IDS>(sourceOptions[0]);
  const [pvcNameSelected, selectPVCName] = React.useState<string>();
  const [pvcNamespaceSelected, selectPVCNamespace] = React.useState<string>();
  const [httpURL, setHTTPURL] = React.useState('');
  const [containerImage, setContainerImage] = React.useState('');

  React.useEffect(() => {
    switch (selectedSourceType) {
      case DEFAULT_SOURCE:
        return onSourceChange(undefined);
      case BLANK_SOURCE_NAME:
        return onSourceChange(
          getGenericSourceCustomization(selectedSourceType, null, volumeQuantity),
        );
      case PVC_SOURCE_NAME:
        return onSourceChange(
          getPVCSource(pvcNameSelected, pvcNamespaceSelected, withSize ? volumeQuantity : null),
        );
      case HTTP_SOURCE_NAME:
        return onSourceChange(
          getGenericSourceCustomization(
            selectedSourceType,
            httpURL,
            withSize ? volumeQuantity : null,
          ),
        );
      case CONTAINER_DISK_SOURCE_NAME:
      case REGISTRY_SOURCE_NAME:
        return onSourceChange(
          getGenericSourceCustomization(
            selectedSourceType,
            appendDockerPrefix(containerImage),
            withSize ? volumeQuantity : null,
          ),
        );
    }
  }, [
    onSourceChange,
    pvcNameSelected,
    pvcNamespaceSelected,
    httpURL,
    containerImage,
    volumeQuantity,
    selectedSourceType,
    withSize,
  ]);

  return (
    <div id="SelectSource">
      <SelectSourceOption
        onSelectSource={setSourceType}
        selectedSource={selectedSourceType}
        label={sourceLabel}
        options={sourceOptions}
      />

      {selectedSourceType === PVC_SOURCE_NAME && (
        <PersistentVolumeClaimSelect
          pvcNameSelected={pvcNameSelected}
          projectSelected={pvcNamespaceSelected}
          selectNamespace={selectPVCNamespace}
          selectPVCName={selectPVCName}
        />
      )}

      {selectedSourceType === HTTP_SOURCE_NAME && (
        <FormGroup
          label={t('Image URL')}
          fieldId={`disk-source-required-${selectedSourceType}`}
          isRequired
          className="disk-source-form-group"
          helperText={httpSourceHelperText}
        >
          <TextInput
            value={httpURL}
            type="text"
            onChange={setHTTPURL}
            aria-label={t('Image URL')}
            validated={!httpURL ? ValidatedOptions.error : ValidatedOptions.default}
          />
        </FormGroup>
      )}

      {[REGISTRY_SOURCE_NAME, CONTAINER_DISK_SOURCE_NAME].includes(selectedSourceType) && (
        <FormGroup
          label={t('Container Image')}
          fieldId={`disk-source-required-${selectedSourceType}`}
          isRequired
          className="disk-source-form-group"
          helperText={registrySourceHelperText}
        >
          <TextInput
            id="container-image-registry"
            value={containerImage}
            type="text"
            onChange={setContainerImage}
            aria-label={t('Container Image')}
            validated={!containerImage ? ValidatedOptions.error : ValidatedOptions.default}
          />
        </FormGroup>
      )}

      {withSize && selectedSourceType !== DEFAULT_SOURCE && (
        <VolumeSize quantity={volumeQuantity} onChange={setVolumeQuantity} />
      )}
    </div>
  );
};
