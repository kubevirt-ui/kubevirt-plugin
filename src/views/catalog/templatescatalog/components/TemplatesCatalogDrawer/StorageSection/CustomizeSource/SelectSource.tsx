import React, {
  FC,
  FormEventHandler,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  useRef,
} from 'react';

import { useDrawerContext } from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/hooks/useDrawerContext';
import { V1beta1DataVolumeSpec, V1ContainerDiskSource } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { getIsMinusDisabled } from '@kubevirt-utils/components/CapacityInput/utils';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getRootDiskStorageRequests } from '@kubevirt-utils/resources/vm';
import { appendDockerPrefix } from '@kubevirt-utils/utils/utils';
import { removeAllWhitespace } from '@kubevirt-utils/utils/utils';

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
  getMinDiskSize,
  getPVCSource,
  getQuantityFromSource,
  getSourceTypeFromDiskSource,
} from './utils';

export type SelectSourceProps = {
  'data-test-id': string;
  diskSource?: boolean;
  httpSourceHelperURL?: string;
  onFileSelected: (file: File | string) => void;
  onSourceChange: (customSource: V1beta1DataVolumeSpec | V1ContainerDiskSource) => void;
  registrySourceHelperText?: string;
  relevantUpload?: DataUpload;
  selectedSource?: V1beta1DataVolumeSpec | V1ContainerDiskSource;
  sourceLabel: ReactNode | string;
  sourceOptions: SOURCE_OPTIONS_IDS[];
  sourcePopOver?: ReactElement<any, JSXElementConstructor<any> | string>;
};

export const SelectSource: FC<SelectSourceProps> = ({
  'data-test-id': testId,
  diskSource = false,
  httpSourceHelperURL,
  onFileSelected,
  onSourceChange,
  registrySourceHelperText,
  relevantUpload,
  selectedSource,
  sourceLabel,
  sourceOptions,
  sourcePopOver,
}) => {
  const { t } = useKubevirtTranslation();
  const initialDiskSource = useRef(selectedSource);
  const { originalTemplate, registryCredentials, setRegistryCredentials } = useDrawerContext();

  const volumeQuantity = getQuantityFromSource(selectedSource as V1beta1DataVolumeSpec);

  const templateDiskSize = getRootDiskStorageRequests(
    getTemplateVirtualMachineObject(originalTemplate),
  );

  const minDiskValue = diskSource ? getMinDiskSize(templateDiskSize, volumeQuantity) : undefined;
  const isMinusDisabled = getIsMinusDisabled(minDiskValue, volumeQuantity);

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

  const sourceType = getSourceTypeFromDiskSource(selectedSource);

  const selectedSourceType =
    selectedSource === initialDiskSource.current && sourceOptions.includes(DEFAULT_SOURCE)
      ? DEFAULT_SOURCE
      : sourceType;

  const cdSourceWithSizeInput = [HTTP_SOURCE_NAME, UPLOAD_SOURCE_NAME].includes(sourceType);
  const diskSourceWithSizeInput = sourceType !== CONTAINER_DISK_SOURCE_NAME;

  const showSizeInput = diskSource ? diskSourceWithSizeInput : cdSourceWithSizeInput;

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
    const newValue = removeAllWhitespace(event.currentTarget.value);
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
          registryCredentials={registryCredentials}
          registrySourceHelperText={registrySourceHelperText}
          selectedSourceType={selectedSourceType}
          setRegistryCredentials={setRegistryCredentials}
          testId={testId}
        />
      )}

      {showSizeInput && (
        <CapacityInput
          isMinusDisabled={isMinusDisabled}
          label={t('Disk size')}
          minValue={minDiskValue}
          onChange={setVolumeQuantity}
          size={volumeQuantity}
        />
      )}
    </>
  );
};
