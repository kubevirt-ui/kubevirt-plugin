import * as React from 'react';
import { TFunction } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

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

const getSourceOption = (source: SOURCE_OPTIONS_IDS, t: TFunction) => {
  switch (source) {
    case DEFAULT_SOURCE:
      return (
        <SelectOption
          value={DEFAULT_SOURCE}
          description={t('Use the default template disk source')}
        >
          <span data-test-id={DEFAULT_SOURCE}>{t('Default')}</span>
        </SelectOption>
      );
    case PVC_SOURCE_NAME:
      return (
        <SelectOption
          value={PVC_SOURCE_NAME}
          description={t(
            'Select an existing persistent volume claim already available on the cluster and clone it.',
          )}
        >
          <span data-test-id={PVC_SOURCE_NAME}>{t('PVC (clone PVC)')}</span>
        </SelectOption>
      );
    case HTTP_SOURCE_NAME:
      return (
        <SelectOption
          value={HTTP_SOURCE_NAME}
          description={t('Import content via URL (HTTP or S3 endpoint).')}
        >
          <span data-test-id={HTTP_SOURCE_NAME}>{t('URL (creates PVC)')}</span>
        </SelectOption>
      );
    case REGISTRY_SOURCE_NAME:
      return (
        <SelectOption
          value={REGISTRY_SOURCE_NAME}
          description={t('Import content via container registry.')}
        >
          <span data-test-id={REGISTRY_SOURCE_NAME}>{t('Registry (creates PVC)')}</span>
        </SelectOption>
      );
    case CONTAINER_DISK_SOURCE_NAME:
      return (
        <SelectOption
          value={REGISTRY_SOURCE_NAME}
          description={t('Import content via container registry.')}
        >
          <span data-test-id={REGISTRY_SOURCE_NAME}>{t('Registry (ContainerDisk)')}</span>
        </SelectOption>
      );
    case UPLOAD_SOURCE_NAME:
      return (
        <SelectOption
          value={UPLOAD_SOURCE_NAME}
          description={t('Upload new file using the "Upload data to Persistent Volume Claim" page')}
        >
          <a
            data-test-id={UPLOAD_SOURCE_NAME}
            href="/k8s/ns/default/persistentvolumeclaims/~new/data"
            target="_blank"
          >
            {t('Upload (Upload a new file to a PVC)')} <ExternalLinkAltIcon />
          </a>
        </SelectOption>
      );
    case BLANK_SOURCE_NAME:
      return (
        <SelectOption value={BLANK_SOURCE_NAME} description={t('Create a new blank PVC')}>
          <span data-test-id={BLANK_SOURCE_NAME}>{t('Blank')}</span>
        </SelectOption>
      );
  }
};

type SelectSourceOptionProps = {
  label: React.ReactNode;
  onSelectSource: (selection: SOURCE_OPTIONS_IDS) => void;
  selectedSource: SOURCE_OPTIONS_IDS;
  options: SOURCE_OPTIONS_IDS[];
};

const SelectSourceOption: React.FC<SelectSourceOptionProps> = ({
  label,
  onSelectSource,
  selectedSource,
  options,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const onSelect = React.useCallback(
    (event, selection) => {
      setIsOpen(false);

      if (selection !== UPLOAD_SOURCE_NAME) onSelectSource(selection);
      else history.push('/k8s/ns/default/persistentvolumeclaims/~new/data');
    },
    [history, onSelectSource],
  );

  return (
    <FormGroup
      label={label}
      fieldId="disk-source-required-disk"
      isRequired
      className="disk-source-form-group select-source-option"
    >
      <Select
        isOpen={isOpen}
        onToggle={setIsOpen}
        onSelect={onSelect}
        variant={SelectVariant.single}
        selections={selectedSource}
        maxHeight={400}
      >
        {options.map((option) => getSourceOption(option, t))}
      </Select>
    </FormGroup>
  );
};

export default SelectSourceOption;
