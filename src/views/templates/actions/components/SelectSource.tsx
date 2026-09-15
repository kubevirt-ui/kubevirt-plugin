/* eslint-disable max-lines */
import { type FC, type ReactNode } from 'react';

import { type V1beta1DataVolumeSpec } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/utils/constants';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { SOURCE_TYPES, type SourceOptionsIds } from '../../utils/constants';
import { PersistentVolumeClaimSelect } from './PersistentVolumeClaimSelect/PersistentVolumeClaimSelect';
import SelectSourceOption from './SelectSourceOption';
import {
  getGenericSourceCustomization,
  getPVCSource,
  getSourceTypeFromDataVolumeSpec,
} from './utils';

type SelectSourceProps = {
  httpSourceHelperText?: string;
  initialVolumeQuantity?: string;
  onSourceChange: (customSource: V1beta1DataVolumeSpec) => void;
  source: V1beta1DataVolumeSpec;
  sourceLabel: ReactNode;
  sourceOptions: SourceOptionsIds[];
  withSize?: boolean;
};

export const SelectSource: FC<SelectSourceProps> = ({
  httpSourceHelperText,
  initialVolumeQuantity = DEFAULT_DISK_SIZE,
  onSourceChange,
  source,
  sourceLabel,
  sourceOptions,
  withSize = false,
}) => {
  const { t } = useKubevirtTranslation();
  const selectedSourceType = getSourceTypeFromDataVolumeSpec(source);
  const pvcNameSelected = source?.source?.pvc?.name;
  const pvcNamespaceSelected = source?.source?.pvc?.namespace;
  const httpURL = source?.source?.http?.url;
  const containerImage = source?.source?.registry?.url;
  const volumeQuantity = source?.storage?.resources?.requests?.storage ?? initialVolumeQuantity;

  const onSourceSelected = (newSourceType: SourceOptionsIds, newVolumeQuantity?: string): void => {
    const selectedVolumeQuantity = newVolumeQuantity ?? volumeQuantity;

    switch (newSourceType) {
      case SOURCE_TYPES.httpSource:
        onSourceChange(
          getGenericSourceCustomization(
            newSourceType,
            httpURL,
            withSize ? selectedVolumeQuantity : null,
          ),
        );
        return;
      case SOURCE_TYPES.pvcSource:
        onSourceChange(
          getPVCSource(
            pvcNameSelected,
            pvcNamespaceSelected,
            withSize ? selectedVolumeQuantity : null,
          ),
        );
        return;
      case SOURCE_TYPES.registrySource:
        onSourceChange(
          getGenericSourceCustomization(
            newSourceType,
            containerImage ?? '',
            withSize ? selectedVolumeQuantity : null,
          ),
        );
        return;
      default:
        return;
    }
  };

  const onContainerChange = (newContainerURL: string): void => {
    onSourceChange(
      getGenericSourceCustomization(
        selectedSourceType,
        newContainerURL ?? '',
        withSize ? volumeQuantity : null,
      ),
    );
  };

  const onURLChange = (newUrl: string): void => {
    onSourceChange(
      getGenericSourceCustomization(
        selectedSourceType,
        newUrl,
        withSize ? volumeQuantity : undefined,
      ),
    );
  };

  return (
    <>
      <SelectSourceOption
        label={sourceLabel}
        onSelectSource={(newSourceType) => onSourceSelected(newSourceType)}
        options={sourceOptions}
        selectedSource={selectedSourceType}
      />

      {selectedSourceType === SOURCE_TYPES.pvcSource && (
        <PersistentVolumeClaimSelect
          projectSelected={pvcNamespaceSelected}
          pvcNameSelected={pvcNameSelected}
          selectPVC={(newPVCNamespace, newPVCName) =>
            onSourceChange(
              getPVCSource(newPVCName, newPVCNamespace, withSize ? volumeQuantity : undefined),
            )
          }
        />
      )}

      {selectedSourceType === SOURCE_TYPES.registrySource && (
        <FormGroup
          className="disk-source-form-group"
          fieldId={`disk-source-required-${selectedSourceType}`}
          isRequired
          label={t('Container image')}
        >
          <TextInput
            aria-label={t('Container image')}
            onChange={(_event, newContainerURL) => onContainerChange(newContainerURL)}
            type="text"
            value={containerImage}
          />
          <FormGroupHelperText>
            {t('Example: {{exampleURL}}', {
              exampleURL: 'quay.io/containerdisks/fedora:latest',
            })}
          </FormGroupHelperText>
        </FormGroup>
      )}

      {selectedSourceType === SOURCE_TYPES.httpSource && (
        <FormGroup
          className="disk-source-form-group"
          fieldId={`disk-source-required-${selectedSourceType}`}
          isRequired
          label={t('Image URL')}
        >
          <TextInput
            aria-label={t('Image URL')}
            onChange={(_event, newUrl) => onURLChange(newUrl)}
            type="text"
            validated={!httpURL ? ValidatedOptions.error : ValidatedOptions.default}
            value={httpURL}
          />
          <FormGroupHelperText>{httpSourceHelperText}</FormGroupHelperText>
        </FormGroup>
      )}

      {withSize && selectedSourceType !== SOURCE_TYPES.defaultSource && (
        <CapacityInput
          label={t('Disk size')}
          onChange={(newVolume) => onSourceSelected(selectedSourceType, newVolume)}
          size={volumeQuantity}
        />
      )}
    </>
  );
};
