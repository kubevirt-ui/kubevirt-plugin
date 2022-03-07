import * as React from 'react';

import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Checkbox,
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';

import { PersistentVolumeClaimSelect } from '../PersistentVolumeClaimSelect';

import {
  DEFAULT_SOURCE,
  HTTP_SOURCE_NAME,
  PVC_SOURCE_NAME,
  REGISTRY_SOURCE_NAME,
} from './constants';
import { SelectDiskSourceLabel } from './SelectDiskSourceLabel';
import { getGenericSourceCustomization, getPVCSource } from './utils';
import { VolumeSize } from './VolumeSize';
import { SOURCE_OPTIONS_IDS } from '.';

import './CustomizeSource.scss';

export type CustomizeSourceProps = {
  onChange: (customSource: V1beta1DataVolumeSpec) => void;
  initialVolumeQuantity?: string;
};

export const CustomizeSource: React.FC<CustomizeSourceProps> = ({
  onChange,
  initialVolumeQuantity,
}) => {
  const { t } = useKubevirtTranslation();

  const [selectedSourceType, setSourceType] = React.useState<SOURCE_OPTIONS_IDS>(DEFAULT_SOURCE);
  const [pvcNameSelected, selectPVCName] = React.useState<string>();
  const [pvcNamespaceSelected, selectPVCNamespace] = React.useState<string>();
  const [volumeQuantity, setVolumeQuantity] = React.useState(initialVolumeQuantity || '30Gi');
  const [httpURL, setHTTPURL] = React.useState('');
  const [containerImage, setContainerImage] = React.useState('');

  const [isOpen, setIsOpen] = React.useState(false);

  const onSelectDiskSource = React.useCallback((event, selection) => {
    setSourceType(selection);
    setIsOpen(false);
  }, []);

  React.useEffect(() => {
    switch (selectedSourceType) {
      case DEFAULT_SOURCE:
        return onChange(undefined);
      case PVC_SOURCE_NAME:
        return onChange(getPVCSource(pvcNameSelected, pvcNamespaceSelected));
      case HTTP_SOURCE_NAME:
        return onChange(getGenericSourceCustomization(selectedSourceType, httpURL, volumeQuantity));
      case REGISTRY_SOURCE_NAME:
        return onChange(
          getGenericSourceCustomization(selectedSourceType, containerImage, volumeQuantity),
        );
    }
  }, [
    onChange,
    pvcNameSelected,
    pvcNamespaceSelected,
    httpURL,
    containerImage,
    volumeQuantity,
    selectedSourceType,
  ]);

  return (
    <>
      <FormGroup
        label={<SelectDiskSourceLabel />}
        fieldId={`disk-source-required-disk`}
        isRequired
        className="disk-source-form-group"
      >
        <Select
          isOpen={isOpen}
          onToggle={setIsOpen}
          onSelect={onSelectDiskSource}
          variant={SelectVariant.single}
          selections={selectedSourceType}
          maxHeight={400}
        >
          <SelectOption
            value={DEFAULT_SOURCE}
            description={t('Use the default template disk source')}
          >
            <span data-test-id={DEFAULT_SOURCE}>{t('Default')}</span>
          </SelectOption>
          <SelectOption
            value={PVC_SOURCE_NAME}
            description={t(
              'Select an existing persistent volume claim already available on the cluster and clone it.',
            )}
          >
            <span data-test-id={PVC_SOURCE_NAME}>{t('PVC (creates PVC)')}</span>
          </SelectOption>

          <SelectOption
            value={HTTP_SOURCE_NAME}
            description={t('Import content via URL (HTTP or S3 endpoint).')}
          >
            <span data-test-id={HTTP_SOURCE_NAME}>{t('URL (creates PVC)')}</span>
          </SelectOption>

          <SelectOption
            value={REGISTRY_SOURCE_NAME}
            description={t('Import content via container registry.')}
          >
            <span data-test-id={REGISTRY_SOURCE_NAME}>{t('Registry (creates PVC)')}</span>
          </SelectOption>
        </Select>
      </FormGroup>

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

      {selectedSourceType === REGISTRY_SOURCE_NAME && (
        <FormGroup
          label={t('Container Image')}
          fieldId={`disk-source-required-${selectedSourceType}`}
          isRequired
          className="disk-source-form-group"
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

      {[HTTP_SOURCE_NAME, REGISTRY_SOURCE_NAME].includes(selectedSourceType) && (
        <VolumeSize quantity={volumeQuantity} onChange={setVolumeQuantity} />
      )}

      <FormGroup label={t('CD-ROM boot source')} fieldId={`customize-cdrom`}>
        <Checkbox isChecked={false} label={t('Mount disk drive')} id="cdrom" />
      </FormGroup>
    </>
  );
};
