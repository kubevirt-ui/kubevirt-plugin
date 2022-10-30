import React from 'react';

import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { SOURCE_OPTIONS_IDS, SOURCE_TYPES } from '../../utils/constants';

import { PersistentVolumeClaimSelect } from './PersistentVolumeClaimSelect/PersistentVolumeClaimSelect';
import SelectSourceOption from './SelectSourceOption';
import {
  getGenericSourceCustomization,
  getPVCSource,
  getSourceTypeFromDataVolumeSpec,
} from './utils';

type SelectSourceProps = {
  source: V1beta1DataVolumeSpec;
  onSourceChange: (customSource: V1beta1DataVolumeSpec) => void;
  sourceLabel: React.ReactNode;
  initialVolumeQuantity?: string;
  withSize?: boolean;
  sourceOptions: SOURCE_OPTIONS_IDS[];
  httpSourceHelperText?: string;
};

export const SelectSource: React.FC<SelectSourceProps> = ({
  source,
  onSourceChange,
  initialVolumeQuantity = '30Gi',
  withSize = false,
  sourceOptions,
  sourceLabel,
  httpSourceHelperText,
}) => {
  const { t } = useKubevirtTranslation();
  const selectedSourceType = getSourceTypeFromDataVolumeSpec(source);
  const pvcNameSelected = source?.source?.pvc?.name;
  const pvcNamespaceSelected = source?.source?.pvc?.namespace;
  const httpURL = source?.source?.http?.url;
  const containerImage = source?.source?.registry?.url;
  const volumeQuantity = source?.storage?.resources?.requests?.storage || initialVolumeQuantity;

  const onSourceSelected = (newSourceType: SOURCE_OPTIONS_IDS, newVolumeQuantity?: string) => {
    const selectedVolumeQuantity = newVolumeQuantity || volumeQuantity;

    switch (newSourceType) {
      case SOURCE_TYPES.httpSource:
        return onSourceChange(
          getGenericSourceCustomization(
            newSourceType,
            httpURL,
            withSize ? selectedVolumeQuantity : null,
          ),
        );
      case SOURCE_TYPES.pvcSource:
        return onSourceChange(
          getPVCSource(
            pvcNameSelected,
            pvcNamespaceSelected,
            withSize ? selectedVolumeQuantity : null,
          ),
        );
      case SOURCE_TYPES.registrySource:
        return onSourceChange(
          getGenericSourceCustomization(
            newSourceType,
            containerImage || '',
            withSize ? selectedVolumeQuantity : null,
          ),
        );
      default:
        return;
    }
  };

  const onContainerChange = (newContainerURL) =>
    onSourceChange(
      getGenericSourceCustomization(
        selectedSourceType,
        newContainerURL || '',
        withSize ? volumeQuantity : null,
      ),
    );

  const onURLChange = (newUrl) =>
    onSourceChange(
      getGenericSourceCustomization(selectedSourceType, newUrl, withSize ? volumeQuantity : null),
    );

  return (
    <>
      <SelectSourceOption
        onSelectSource={(newSourceType) => onSourceSelected(newSourceType)}
        selectedSource={selectedSourceType}
        label={sourceLabel}
        options={sourceOptions}
      />

      {selectedSourceType === SOURCE_TYPES.pvcSource && (
        <PersistentVolumeClaimSelect
          pvcNameSelected={pvcNameSelected}
          projectSelected={pvcNamespaceSelected}
          selectPVC={(newPVCNamespace, newPVCName) =>
            onSourceChange(
              getPVCSource(newPVCName, newPVCNamespace, withSize ? volumeQuantity : null),
            )
          }
        />
      )}

      {selectedSourceType === SOURCE_TYPES.registrySource && (
        <FormGroup
          label={t('Container Image')}
          fieldId={`disk-source-required-${selectedSourceType}`}
          isRequired
          className="disk-source-form-group"
          helperText={
            <>
              {t('Example: {{exampleURL}}', {
                exampleURL: 'quay.io/containerdisks/fedora:latest',
              })}
            </>
          }
        >
          <TextInput
            value={containerImage}
            type="text"
            onChange={onContainerChange}
            aria-label={t('Container Image')}
          />
        </FormGroup>
      )}

      {selectedSourceType === SOURCE_TYPES.httpSource && (
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
            onChange={onURLChange}
            aria-label={t('Image URL')}
            validated={!httpURL ? ValidatedOptions.error : ValidatedOptions.default}
          />
        </FormGroup>
      )}

      {withSize && selectedSourceType !== SOURCE_TYPES.defaultSource && (
        <CapacityInput
          size={volumeQuantity}
          onChange={(newVolume) => onSourceSelected(selectedSourceType, newVolume)}
          label={t('Disk size')}
        />
      )}
    </>
  );
};
