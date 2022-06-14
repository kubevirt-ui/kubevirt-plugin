import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskSizeNumberInput from '@kubevirt-utils/components/DiskModal/DiskFormFields/DiskSizeInput/DiskSizeNumberInput';
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
import { appendDockerPrefix, getGenericSourceCustomization, getPVCSource } from './utils';

export type SelectSourceProps = {
  onSourceChange: (customSource: V1beta1DataVolumeSpec) => void;
  selectedSource?: V1beta1DataVolumeSpec;
  sourceLabel: React.ReactNode | string;
  sourcePopOver?: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  initialVolumeQuantity?: string;
  withSize?: boolean;
  sourceOptions: SOURCE_OPTIONS_IDS[];
  httpSourceHelperText?: string;
  registrySourceHelperText?: string;
  'data-test-id': string;
  relevantUpload?: DataUpload;
  defaultsAsBlank?: boolean;
};

export const SelectSource: React.FC<SelectSourceProps> = ({
  onSourceChange,
  initialVolumeQuantity = '30Gi',
  withSize = false,
  sourceOptions,
  sourceLabel,
  sourcePopOver,
  httpSourceHelperText,
  registrySourceHelperText,
  'data-test-id': testId,
  relevantUpload,
  defaultsAsBlank,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    register,
    watch,
    control,
    formState: { errors },
  } = useFormContext();
  const httpURL = watch(`${testId}-httpURL`);
  const containerImage = watch(`${testId}-containerImage`);

  const [volumeQuantity, setVolumeQuantity] = React.useState(initialVolumeQuantity);

  const [selectedSourceType, setSourceType] = React.useState<SOURCE_OPTIONS_IDS>(sourceOptions[0]);
  const [pvcNameSelected, selectPVCName] = React.useState<string>();
  const [pvcNamespaceSelected, selectPVCNamespace] = React.useState<string>();
  const showSizeInput = withSize || selectedSourceType === HTTP_SOURCE_NAME;

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
        onSelectSource={setSourceType}
        selectedSource={selectedSourceType}
        label={sourceLabel}
        popOver={sourcePopOver}
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
          validated={
            errors?.[`${testId}-httpURL`] ? ValidatedOptions.error : ValidatedOptions.default
          }
          helperTextInvalid={t('This field is required')}
          helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
        >
          <FormTextInput
            {...register(`${testId}-httpURL`, { required: true })}
            id={`${testId}-${selectedSourceType}`}
            type="text"
            aria-label={t('Image URL')}
            data-test-id={`${testId}-http-source-input`}
            validated={
              errors?.[`${testId}-httpURL`] ? ValidatedOptions.error : ValidatedOptions.default
            }
          />
        </FormGroup>
      )}

      {selectedSourceType === UPLOAD_SOURCE_NAME && (
        <>
          <FormGroup
            label={t('Upload data')}
            fieldId={`${testId}-${selectedSourceType}`}
            isRequired
            className="disk-source-form-group"
            validated={
              errors?.[`${testId}-uploadFile`] ? ValidatedOptions.error : ValidatedOptions.default
            }
            helperTextInvalid={t('This field is required')}
            helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
          >
            <Stack hasGutter>
              <StackItem>
                <Controller
                  name={`${testId}-uploadFile`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value: fileValue, onChange }, fieldState: { error } }) => (
                    <FileUpload
                      name={`${testId}-uploadFile`}
                      id="simple-file"
                      value={fileValue?.value}
                      filename={fileValue?.filename}
                      data-test-id="disk-source-upload-pvc-file"
                      filenamePlaceholder={t('Drag and drop an image or upload one')}
                      onChange={(value, filename) => {
                        onChange({ value, filename });
                      }}
                      onClearClick={() => onChange(undefined)}
                      validated={error ? ValidatedOptions.error : ValidatedOptions.default}
                    />
                  )}
                />
              </StackItem>
              <StackItem>
                {relevantUpload && <SelectSourceUploadPVCProgress upload={relevantUpload} />}
              </StackItem>
            </Stack>
          </FormGroup>
        </>
      )}

      {[REGISTRY_SOURCE_NAME, CONTAINER_DISK_SOURCE_NAME].includes(selectedSourceType) && (
        <FormGroup
          label={t('Container Image')}
          fieldId={`${testId}-${selectedSourceType}`}
          isRequired
          className="disk-source-form-group"
          helperText={registrySourceHelperText}
          validated={
            errors?.[`${testId}-containerImage`] ? ValidatedOptions.error : ValidatedOptions.default
          }
          helperTextInvalid={t('This field is required')}
          helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
        >
          <FormTextInput
            {...register(`${testId}-containerImage`, { required: true })}
            id={`${testId}-${selectedSourceType}`}
            type="text"
            aria-label={t('Container Image')}
            data-test-id={`${testId}-container-source-input`}
            validated={
              errors?.[`${testId}-containerImage`]
                ? ValidatedOptions.error
                : ValidatedOptions.default
            }
          />
        </FormGroup>
      )}

      {showSizeInput && selectedSourceType !== DEFAULT_SOURCE && (
        <DiskSizeNumberInput
          diskSize={volumeQuantity}
          onChange={setVolumeQuantity}
          label={t('Disk size')}
        />
      )}
    </>
  );
};
