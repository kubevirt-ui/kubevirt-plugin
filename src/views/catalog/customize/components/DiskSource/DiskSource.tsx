import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Checkbox,
  FormGroup,
  Popover,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { PersistentVolumeClaimSelect } from '../PersistentVolumeClaimSelect';

import {
  DEFAULT_DISK_SOURCE,
  DISK_SOURCE,
  HTTP_DISK_SOURCE_NAME,
  PVC_DISK_SOURCE_NAME,
  REGISTRY_DISK_SOURCE_NAME,
} from './constants';
import { getGenericDiskSourceCustomization, getPVCDiskSource } from './utils';
import { VolumeSize } from './VolumeSize';
import { DISK_SOURCE_OPTIONS_IDS } from '.';

import './DiskSource.scss';

type DiskSourceProps = {
  onChange: (diskSource: DISK_SOURCE) => void;
  error?: string;
  volumeError?: string;
  initialVolumeQuantity?: string;
};

export const DiskSource: React.FC<DiskSourceProps> = ({
  onChange,
  error,
  volumeError,
  initialVolumeQuantity,
}) => {
  const { t } = useKubevirtTranslation();

  const [selectedSourceType, setSourceType] =
    React.useState<DISK_SOURCE_OPTIONS_IDS>(DEFAULT_DISK_SOURCE);
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

  const diskSourceLabel = (
    <>
      {t('Disk source')}{' '}
      <Popover
        aria-label={t('Help')}
        bodyContent={() => (
          <div>
            {t(
              'Disk Source represents the source for our Disk, this can be HTTP, Registry or an excisting PVC',
            )}
          </div>
        )}
      >
        <HelpIcon />
      </Popover>
    </>
  );

  React.useEffect(() => {
    switch (selectedSourceType) {
      case DEFAULT_DISK_SOURCE:
        return onChange(undefined);
      case PVC_DISK_SOURCE_NAME:
        return onChange(getPVCDiskSource(pvcNameSelected, pvcNamespaceSelected));
      case HTTP_DISK_SOURCE_NAME:
        return onChange(
          getGenericDiskSourceCustomization(selectedSourceType, httpURL, volumeQuantity),
        );
      case REGISTRY_DISK_SOURCE_NAME:
        return onChange(
          getGenericDiskSourceCustomization(selectedSourceType, containerImage, volumeQuantity),
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
        label={diskSourceLabel}
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
        >
          <SelectOption
            value={DEFAULT_DISK_SOURCE}
            description={t('Use the default template disk source')}
          >
            <span data-test-id={DEFAULT_DISK_SOURCE}>{t('Default')}</span>
          </SelectOption>
          <SelectOption
            value={PVC_DISK_SOURCE_NAME}
            description={t(
              'Select an existing persistent volume claim already available on the cluster and clone it.',
            )}
          >
            <span data-test-id={PVC_DISK_SOURCE_NAME}>{t('PVC (creates PVC)')}</span>
          </SelectOption>

          <SelectOption
            value={HTTP_DISK_SOURCE_NAME}
            description={t('Import content via URL (HTTP or S3 endpoint).')}
          >
            <span data-test-id={HTTP_DISK_SOURCE_NAME}>{t('URL (creates PVC)')}</span>
          </SelectOption>

          <SelectOption
            value={REGISTRY_DISK_SOURCE_NAME}
            description={t('Import content via container registry.')}
          >
            <span data-test-id={REGISTRY_DISK_SOURCE_NAME}>{t('Registry (creates PVC)')}</span>
          </SelectOption>
        </Select>
      </FormGroup>

      {selectedSourceType === PVC_DISK_SOURCE_NAME && (
        <PersistentVolumeClaimSelect
          pvcNameSelected={pvcNameSelected}
          namespaceSelected={pvcNamespaceSelected}
          selectNamespace={selectPVCNamespace}
          selectPVCName={selectPVCName}
          error={error}
        />
      )}

      {selectedSourceType === HTTP_DISK_SOURCE_NAME && (
        <FormGroup
          label={t('Image URL')}
          fieldId={`disk-source-required-${selectedSourceType}`}
          isRequired
          className="disk-source-form-group"
          validated={error ? 'error' : 'default'}
          helperTextInvalid={error}
          helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
        >
          <TextInput
            value={httpURL}
            type="text"
            onChange={setHTTPURL}
            aria-label={t('Image URL')}
            validated={error ? 'error' : 'default'}
          />
        </FormGroup>
      )}

      {selectedSourceType === REGISTRY_DISK_SOURCE_NAME && (
        <FormGroup
          label={t('Container Image')}
          fieldId={`disk-source-required-${selectedSourceType}`}
          isRequired
          className="disk-source-form-group"
          validated={error ? 'error' : 'default'}
          helperTextInvalid={error}
          helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
        >
          <TextInput
            value={containerImage}
            type="text"
            onChange={setContainerImage}
            aria-label={t('Container Image')}
            validated={error ? 'error' : 'default'}
          />
        </FormGroup>
      )}

      {[HTTP_DISK_SOURCE_NAME, REGISTRY_DISK_SOURCE_NAME].includes(selectedSourceType) && (
        <VolumeSize quantity={volumeQuantity} onChange={setVolumeQuantity} error={volumeError} />
      )}

      <FormGroup label={t('CD-ROM boot source')} fieldId={`customize-cdrom`}>
        <Checkbox isChecked={false} label={t('Mount disk drive')} id="cdrom" />
      </FormGroup>
    </>
  );
};
