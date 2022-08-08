import * as React from 'react';

import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { SOURCE_OPTIONS_IDS, SOURCE_TYPES } from '../../utils/constants';

import { PersistentVolumeClaimSelect } from './PersistentVolumeClaimSelect/PersistentVolumeClaimSelect';
import SelectSourceOption from './SelectSourceOption';
import { VolumeSize } from './VolumeSize';

const getGenericSourceCustomization = (
  diskSourceId: SOURCE_OPTIONS_IDS,
  url?: string,
  storage?: string,
): V1beta1DataVolumeSpec => {
  const dataVolumeSpec: V1beta1DataVolumeSpec = {
    source: {
      [diskSourceId]: {},
    },
    storage: {
      resources: {
        requests: {
          storage: storage ?? '30Gi',
        },
      },
    },
  };

  if (url) dataVolumeSpec.source[diskSourceId].url = url;

  return dataVolumeSpec;
};

const getPVCSource = (
  pvcName: string,
  pvcNamespace: string,
  storage?: string,
): V1beta1DataVolumeSpec => {
  const dataVolumeSpec: V1beta1DataVolumeSpec = {
    source: {
      pvc: {
        name: pvcName,
        namespace: pvcNamespace,
      },
    },
  };

  if (storage)
    dataVolumeSpec.storage = {
      resources: {
        requests: {
          storage,
        },
      },
    };

  return dataVolumeSpec;
};

const appendDockerPrefix = (image: string) => 'docker://'.concat(image);

type SelectSourceProps = {
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

  const [selectedSourceType, setSourceType] = React.useState<SOURCE_OPTIONS_IDS>(null); // sourceOptions[0]
  const [pvcNameSelected, selectPVCName] = React.useState<string>();
  const [pvcNamespaceSelected, selectPVCNamespace] = React.useState<string>();
  const [httpURL, setHTTPURL] = React.useState('');
  const [containerImage, setContainerImage] = React.useState('');

  React.useEffect(() => {
    switch (selectedSourceType) {
      case SOURCE_TYPES.httpSource:
        return onSourceChange(
          getGenericSourceCustomization(
            selectedSourceType,
            httpURL,
            withSize ? volumeQuantity : null,
          ),
        );
      case SOURCE_TYPES.pvcSource:
        return onSourceChange(
          getPVCSource(pvcNameSelected, pvcNamespaceSelected, withSize ? volumeQuantity : null),
        );
      case SOURCE_TYPES.registrySource:
        return onSourceChange(
          getGenericSourceCustomization(
            selectedSourceType,
            appendDockerPrefix(containerImage),
            withSize ? volumeQuantity : null,
          ),
        );
      default:
        break;
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
      />

      {selectedSourceType === SOURCE_TYPES.pvcSource && (
        <PersistentVolumeClaimSelect
          pvcNameSelected={pvcNameSelected}
          projectSelected={pvcNamespaceSelected}
          selectNamespace={selectPVCNamespace}
          selectPVCName={selectPVCName}
        />
      )}

      {selectedSourceType === SOURCE_TYPES.registrySource && (
        <FormGroup
          label={t('Container Image')}
          fieldId={`disk-source-required-${selectedSourceType}`}
          isRequired
          className="disk-source-form-group"
          helperText={registrySourceHelperText}
        >
          <TextInput
            value={containerImage}
            type="text"
            onChange={setContainerImage}
            aria-label={t('Container Image')}
            validated={!containerImage ? ValidatedOptions.error : ValidatedOptions.default}
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
            onChange={setHTTPURL}
            aria-label={t('Image URL')}
            validated={!httpURL ? ValidatedOptions.error : ValidatedOptions.default}
          />
        </FormGroup>
      )}

      {withSize && selectedSourceType !== SOURCE_TYPES.defaultSource && (
        <VolumeSize quantity={volumeQuantity} onChange={setVolumeQuantity} />
      )}
    </>
  );
};
