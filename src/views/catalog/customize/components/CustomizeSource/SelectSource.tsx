import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

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
import {
  appendDockerPrefix,
  getGenericSourceCustomization,
  getPVCSource,
  getSourceTypeFromDiskSource,
} from './utils';
import { VolumeSize } from './VolumeSize';

export type SelectSourceProps = {
  onSourceChange: (customSource: V1beta1DataVolumeSpec) => void;
  selectedSource?: V1beta1DataVolumeSpec;
  sourceLabel: React.ReactNode;
  initialVolumeQuantity?: string;
  withSize?: boolean;
  sourceOptions: SOURCE_OPTIONS_IDS[];
  httpSourceHelperText?: string;
  registrySourceHelperText?: string;
  'data-test-id': string;
};

export const SelectSource: React.FC<SelectSourceProps> = ({
  onSourceChange,
  selectedSource,
  initialVolumeQuantity = '30Gi',
  withSize = false,
  sourceOptions,
  sourceLabel,
  httpSourceHelperText,
  registrySourceHelperText,
  'data-test-id': testId,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const httpURL = watch('httpURL');
  const containerImage = watch('containerImage');

  const [volumeQuantity, setVolumeQuantity] = React.useState(initialVolumeQuantity);

  const [selectedSourceType, setSourceType] = React.useState<SOURCE_OPTIONS_IDS>(sourceOptions[0]);
  const [pvcNameSelected, selectPVCName] = React.useState<string>();
  const [pvcNamespaceSelected, selectPVCNamespace] = React.useState<string>();

  React.useEffect(() => {
    if (selectedSource) setSourceType(getSourceTypeFromDiskSource(selectedSource));
  }, [selectedSource]);

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
    <>
      <SelectSourceOption
        onSelectSource={setSourceType}
        selectedSource={selectedSourceType}
        label={sourceLabel}
        options={sourceOptions}
        data-test-id={testId}
      />

      {selectedSourceType === PVC_SOURCE_NAME && (
        <PersistentVolumeClaimSelect
          pvcNameSelected={pvcNameSelected}
          projectSelected={pvcNamespaceSelected}
          selectNamespace={selectPVCNamespace}
          selectPVCName={selectPVCName}
          data-test-id={`${testId}-pvc-select`}
        />
      )}

      {selectedSourceType === HTTP_SOURCE_NAME && (
        <FormGroup
          label={t('Image URL')}
          fieldId={`${testId}-${selectedSourceType}`}
          isRequired
          className="disk-source-form-group"
          helperText={httpSourceHelperText}
        >
          <FormTextInput
            {...register('httpURL', { required: true })}
            id={`${testId}-${selectedSourceType}`}
            type="text"
            aria-label={t('Image URL')}
            data-test-id={`${testId}-http-source-input`}
            validated={errors?.httpURL ? ValidatedOptions.error : ValidatedOptions.default}
          />
        </FormGroup>
      )}

      {[REGISTRY_SOURCE_NAME, CONTAINER_DISK_SOURCE_NAME].includes(selectedSourceType) && (
        <FormGroup
          label={t('Container Image')}
          fieldId={`${testId}-${selectedSourceType}`}
          isRequired
          className="disk-source-form-group"
          helperText={registrySourceHelperText}
        >
          <FormTextInput
            {...register('containerImage', { required: true })}
            id={`${testId}-${selectedSourceType}`}
            type="text"
            aria-label={t('Container Image')}
            data-test-id={`${testId}-container-source-input`}
            validated={errors?.containerImage ? ValidatedOptions.error : ValidatedOptions.default}
          />
        </FormGroup>
      )}

      {withSize && selectedSourceType !== DEFAULT_SOURCE && (
        <VolumeSize quantity={volumeQuantity} onChange={setVolumeQuantity} />
      )}
    </>
  );
};
