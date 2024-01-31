import React, {
  FC,
  FormEventHandler,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  useRef,
} from 'react';

import { V1beta1DataVolumeSpec, V1ContainerDiskSource } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { appendDockerPrefix } from '@kubevirt-utils/utils/utils';

import {
  BLANK_SOURCE_NAME,
  CONTAINER_DISK_SOURCE_NAME,
  DEFAULT_SOURCE,
  HTTP_SOURCE_NAME,
  PVC_SOURCE_NAME,
  REGISTRY_SOURCE_NAME,
  SOURCE_OPTIONS_IDS,
  UPLOAD_SOURCE_NAME,
} from '../constants';

import ContainerSource from './Sources/ContainerSource';
import HTTPSource from './Sources/HTTPSource';
import { PersistentVolumeClaimSelect } from './Sources/PersistentVolumeClaimSelect';
import UploadSource from './Sources/UploadSource';
import SelectSourceOption from './SelectSourceOption';
import {
  getContainerDiskSource,
  getGenericSourceCustomization,
  getPVCSource,
  getQuantityFromSource,
  getSourceTypeFromDiskSource,
} from './utils';

export type SelectSourceProps = {
  'data-test-id': string;
  httpSourceHelperURL?: string;
  onFileSelected: (file: File | string) => void;
  onSourceChange: (customSource: V1beta1DataVolumeSpec | V1ContainerDiskSource) => void;
  registrySourceHelperText?: string;
  relevantUpload?: DataUpload;
  selectedSource?: V1beta1DataVolumeSpec | V1ContainerDiskSource;
  sourceLabel: ReactNode | string;
  sourceOptions: SOURCE_OPTIONS_IDS[];
  sourcePopOver?: ReactElement<any, JSXElementConstructor<any> | string>;
  withSize?: boolean;
};

export const SelectSource: FC<SelectSourceProps> = ({
  'data-test-id': testId,
  httpSourceHelperURL,
  onFileSelected,
  onSourceChange,
  registrySourceHelperText,
  relevantUpload,
  selectedSource,
  sourceLabel,
  sourceOptions,
  sourcePopOver,
  withSize = false,
}) => {
  const { t } = useKubevirtTranslation();
  const initialDiskSource = useRef(selectedSource);

  const volumeQuantity = getQuantityFromSource(selectedSource as V1beta1DataVolumeSpec);

  const pvcNameSelected = (selectedSource as V1beta1DataVolumeSpec)?.source?.pvc?.name;
  const pvcNamespaceSelected = (selectedSource as V1beta1DataVolumeSpec)?.source?.pvc?.namespace;

  const setVolumeQuantity = (value: string) => {
    const newSource = {
      ...selectedSource,
      storage: {
        ...((selectedSource as V1beta1DataVolumeSpec)?.storage || {}),
        resources: {
          requests: {
            storage: value,
          },
        },
      },
    };

    onSourceChange(newSource);
  };

  const selectedSourceType =
    selectedSource === initialDiskSource.current && sourceOptions.includes(DEFAULT_SOURCE)
      ? DEFAULT_SOURCE
      : getSourceTypeFromDiskSource(selectedSource);

  const showSizeInput =
    withSize ||
    selectedSourceType === HTTP_SOURCE_NAME ||
    selectedSourceType === UPLOAD_SOURCE_NAME;

  const onSourceTypeChange = (selection: SOURCE_OPTIONS_IDS) => {
    const newVolume = showSizeInput ? volumeQuantity : null;
    const storageClassName = (selectedSource as V1beta1DataVolumeSpec)?.storage?.storageClassName;
    const handlers = {
      [BLANK_SOURCE_NAME]: () =>
        getGenericSourceCustomization(selection, null, null, storageClassName),
      [CONTAINER_DISK_SOURCE_NAME]: () => getContainerDiskSource(''),
      [DEFAULT_SOURCE]: () => initialDiskSource.current,
      [HTTP_SOURCE_NAME]: () =>
        getGenericSourceCustomization(selection, '', newVolume, storageClassName),
      [PVC_SOURCE_NAME]: () => getPVCSource('', '', newVolume, storageClassName),
      [REGISTRY_SOURCE_NAME]: () =>
        getGenericSourceCustomization(
          selection,
          appendDockerPrefix(''),
          newVolume,
          storageClassName,
        ),
      [UPLOAD_SOURCE_NAME]: () =>
        getGenericSourceCustomization(selection, null, null, storageClassName),
    };

    if (selection !== UPLOAD_SOURCE_NAME) {
      onFileSelected(null);
    }

    onSourceChange(handlers[selection]());
  };

  const onInputValueChange: FormEventHandler<HTMLInputElement> = (event) => {
    const newVolume = showSizeInput ? volumeQuantity : null;
    const newValue = event.currentTarget.value;

    const handlers = {
      [CONTAINER_DISK_SOURCE_NAME]: () => getContainerDiskSource(appendDockerPrefix(newValue)),
      [HTTP_SOURCE_NAME]: () =>
        getGenericSourceCustomization(selectedSourceType, newValue, newVolume),
      [REGISTRY_SOURCE_NAME]: () =>
        getGenericSourceCustomization(selectedSourceType, appendDockerPrefix(newValue), newVolume),
    };

    onSourceChange(handlers[selectedSourceType]());
  };

  return (
    <>
      <SelectSourceOption
        data-test-id={testId}
        label={sourceLabel}
        onSelectSource={onSourceTypeChange}
        options={sourceOptions}
        popOver={sourcePopOver}
        selectedSource={selectedSourceType}
      />

      {selectedSourceType === PVC_SOURCE_NAME && (
        <PersistentVolumeClaimSelect
          currentSize={volumeQuantity}
          data-test-id={`${testId}-pvc-select`}
          onSourceChange={onSourceChange}
          projectSelected={pvcNamespaceSelected}
          pvcNameSelected={pvcNameSelected}
        />
      )}

      {selectedSourceType === HTTP_SOURCE_NAME && (
        <HTTPSource
          httpSourceHelperURL={httpSourceHelperURL}
          onInputValueChange={onInputValueChange}
          testId={testId}
        />
      )}

      {selectedSourceType === UPLOAD_SOURCE_NAME && (
        <UploadSource
          onFileSelected={onFileSelected}
          relevantUpload={relevantUpload}
          testId={testId}
        />
      )}

      {[CONTAINER_DISK_SOURCE_NAME, REGISTRY_SOURCE_NAME].includes(selectedSourceType) && (
        <ContainerSource
          onInputValueChange={onInputValueChange}
          registrySourceHelperText={registrySourceHelperText}
          selectedSourceType={selectedSourceType}
          testId={testId}
        />
      )}

      {showSizeInput && selectedSourceType !== CONTAINER_DISK_SOURCE_NAME && (
        <CapacityInput label={t('Disk size')} onChange={setVolumeQuantity} size={volumeQuantity} />
      )}
    </>
  );
};
