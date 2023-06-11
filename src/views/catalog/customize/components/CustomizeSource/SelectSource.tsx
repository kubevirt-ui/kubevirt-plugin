import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { V1beta1DataVolumeSpec, V1ContainerDiskSource } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { FileUpload, FormGroup, Stack, StackItem, ValidatedOptions } from '@patternfly/react-core';

import { PersistentVolumeClaimSelect } from '../PersistentVolumeClaimSelect';

import {
  BLANK_SOURCE_NAME,
  CONTAINER_DISK_SOURCE_NAME,
  DEFAULT_SOURCE,
  HTTP_SOURCE_NAME,
  PVC_SOURCE_NAME,
  REGISTRY_SOURCE_NAME,
  SOURCE_OPTIONS_IDS,
  UPLOAD_SOURCE_NAME,
} from './constants';
import SelectSourceOption from './SelectSourceOption';
import { SelectSourceUploadPVCProgress } from './SelectSourceUploadPVCProgress';
import {
  appendDockerPrefix,
  getContainerDiskSource,
  getGenericSourceCustomization,
  getPVCSource,
} from './utils';

export type SelectSourceProps = {
  'data-test-id': string;
  defaultsAsBlank?: boolean;
  httpSourceHelperURL?: string;
  initialVolumeQuantity?: string;
  onSourceChange: (customSource: V1beta1DataVolumeSpec | V1ContainerDiskSource) => void;
  registrySourceHelperText?: string;
  relevantUpload?: DataUpload;
  selectedSource?: V1beta1DataVolumeSpec | V1ContainerDiskSource;
  sourceLabel: React.ReactNode | string;
  sourceOptions: SOURCE_OPTIONS_IDS[];
  sourcePopOver?: React.ReactElement<any, React.JSXElementConstructor<any> | string>;
  withSize?: boolean;
};

export const SelectSource: React.FC<SelectSourceProps> = ({
  'data-test-id': testId,
  defaultsAsBlank,
  httpSourceHelperURL,
  initialVolumeQuantity = '30Gi',
  onSourceChange,
  registrySourceHelperText,
  relevantUpload,
  sourceLabel,
  sourceOptions,
  sourcePopOver,
  withSize = false,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    register,
    watch,
  } = useFormContext();
  const httpURL = watch(`${testId}-httpURL`);
  const containerImage = watch(`${testId}-containerImage`);

  const [volumeQuantity, setVolumeQuantity] = React.useState(initialVolumeQuantity);

  const [selectedSourceType, setSourceType] = React.useState<SOURCE_OPTIONS_IDS>(sourceOptions[0]);
  const [pvcNameSelected, selectPVCName] = React.useState<string>();
  const [pvcNamespaceSelected, selectPVCNamespace] = React.useState<string>();
  const showSizeInput =
    withSize ||
    selectedSourceType === HTTP_SOURCE_NAME ||
    selectedSourceType === UPLOAD_SOURCE_NAME;

  React.useEffect(() => {
    switch (selectedSourceType) {
      case DEFAULT_SOURCE:
        return onSourceChange(undefined);
      case BLANK_SOURCE_NAME:
      case UPLOAD_SOURCE_NAME:
        return onSourceChange(
          getGenericSourceCustomization(selectedSourceType, null, volumeQuantity),
        );
      case PVC_SOURCE_NAME:
        return onSourceChange(
          getPVCSource(
            pvcNameSelected,
            pvcNamespaceSelected,
            showSizeInput ? volumeQuantity : null,
          ),
        );
      case HTTP_SOURCE_NAME:
        return onSourceChange(
          getGenericSourceCustomization(
            selectedSourceType,
            httpURL,
            showSizeInput ? volumeQuantity : null,
          ),
        );
      case CONTAINER_DISK_SOURCE_NAME:
        return onSourceChange(getContainerDiskSource(containerImage));
      case REGISTRY_SOURCE_NAME:
        return onSourceChange(
          getGenericSourceCustomization(
            selectedSourceType,
            appendDockerPrefix(containerImage),
            showSizeInput ? volumeQuantity : null,
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
    showSizeInput,
  ]);

  React.useEffect(() => {
    if (defaultsAsBlank) {
      setSourceType(BLANK_SOURCE_NAME);
    }
  }, [defaultsAsBlank]);

  return (
    <>
      <SelectSourceOption
        data-test-id={testId}
        label={sourceLabel}
        onSelectSource={setSourceType}
        options={sourceOptions}
        popOver={sourcePopOver}
        selectedSource={selectedSourceType}
      />

      {selectedSourceType === PVC_SOURCE_NAME && (
        <PersistentVolumeClaimSelect
          data-test-id={`${testId}-pvc-select`}
          projectSelected={pvcNamespaceSelected}
          pvcNameSelected={pvcNameSelected}
          selectNamespace={selectPVCNamespace}
          selectPVCName={selectPVCName}
        />
      )}

      {selectedSourceType === HTTP_SOURCE_NAME && (
        <FormGroup
          helperText={
            httpSourceHelperURL && (
              <>
                {t('Enter URL to download. for example: ')}
                <a href={httpSourceHelperURL} rel="noreferrer" target="_blank">
                  {httpSourceHelperURL}
                </a>
              </>
            )
          }
          validated={
            errors?.[`${testId}-httpURL`] ? ValidatedOptions.error : ValidatedOptions.default
          }
          className="disk-source-form-group"
          fieldId={`${testId}-${selectedSourceType}`}
          helperTextInvalid={t('This field is required')}
          helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
          isRequired
          label={t('Image URL')}
        >
          <FormTextInput
            {...register(`${testId}-httpURL`, { required: true })}
            validated={
              errors?.[`${testId}-httpURL`] ? ValidatedOptions.error : ValidatedOptions.default
            }
            aria-label={t('Image URL')}
            data-test-id={`${testId}-http-source-input`}
            id={`${testId}-${selectedSourceType}`}
            type="text"
          />
        </FormGroup>
      )}

      {selectedSourceType === UPLOAD_SOURCE_NAME && (
        <>
          <FormGroup
            validated={
              errors?.[`${testId}-uploadFile`] ? ValidatedOptions.error : ValidatedOptions.default
            }
            className="disk-source-form-group"
            fieldId={`${testId}-${selectedSourceType}`}
            helperTextInvalid={t('This field is required')}
            helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
            isRequired
            label={t('Upload data')}
          >
            <Stack hasGutter>
              <StackItem>
                <Controller
                  render={({ field: { onChange, value: fileValue }, fieldState: { error } }) => (
                    <FileUpload
                      onChange={(value, filename) => {
                        onChange({ filename, value });
                      }}
                      data-test-id="disk-source-upload-pvc-file"
                      filename={fileValue?.filename}
                      filenamePlaceholder={t('Drag and drop an image or upload one')}
                      id="simple-file"
                      name={`${testId}-uploadFile`}
                      onClearClick={() => onChange(undefined)}
                      validated={error ? ValidatedOptions.error : ValidatedOptions.default}
                      value={fileValue?.value}
                    />
                  )}
                  control={control}
                  name={`${testId}-uploadFile`}
                  rules={{ required: true }}
                  shouldUnregister
                />
              </StackItem>
              <StackItem>
                {relevantUpload && <SelectSourceUploadPVCProgress upload={relevantUpload} />}
              </StackItem>
            </Stack>
          </FormGroup>
        </>
      )}

      {[CONTAINER_DISK_SOURCE_NAME, REGISTRY_SOURCE_NAME].includes(selectedSourceType) && (
        <FormGroup
          validated={
            errors?.[`${testId}-containerImage`] ? ValidatedOptions.error : ValidatedOptions.default
          }
          className="disk-source-form-group"
          fieldId={`${testId}-${selectedSourceType}`}
          helperText={registrySourceHelperText}
          helperTextInvalid={t('This field is required')}
          helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
          isRequired
          label={t('Container Image')}
        >
          <FormTextInput
            {...register(`${testId}-containerImage`, { required: true })}
            validated={
              errors?.[`${testId}-containerImage`]
                ? ValidatedOptions.error
                : ValidatedOptions.default
            }
            aria-label={t('Container Image')}
            data-test-id={`${testId}-container-source-input`}
            id={`${testId}-${selectedSourceType}`}
            type="text"
          />
        </FormGroup>
      )}

      {showSizeInput && selectedSourceType !== DEFAULT_SOURCE && (
        <CapacityInput label={t('Disk size')} onChange={setVolumeQuantity} size={volumeQuantity} />
      )}
    </>
  );
};
