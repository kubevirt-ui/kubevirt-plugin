import * as React from 'react';
import { useParams } from 'react-router-dom';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import { SOURCE_OPTIONS_IDS, SOURCE_TYPES } from '../../utils/constants';

const getSourceOption = (source: SOURCE_OPTIONS_IDS, ns: string) => {
  switch (source) {
    case SOURCE_TYPES.defaultSource:
      return (
        <SelectOption
          value={SOURCE_TYPES.defaultSource}
          description={t('Use the default Template disk source')}
        >
          <span data-test-id={SOURCE_TYPES.defaultSource}>{t('Default')}</span>
        </SelectOption>
      );
    case SOURCE_TYPES.pvcSource:
      return (
        <SelectOption
          value={SOURCE_TYPES.pvcSource}
          description={t(
            'Select an existing persistent volume claim already available on the cluster and clone it.',
          )}
        >
          <span data-test-id={SOURCE_TYPES.pvcSource}>{t('PVC (clone PVC)')}</span>
        </SelectOption>
      );
    case SOURCE_TYPES.httpSource:
      return (
        <SelectOption
          value={SOURCE_TYPES.httpSource}
          description={t('Import content via URL (HTTP or HTTPS endpoint).')}
        >
          <span data-test-id={SOURCE_TYPES.httpSource}>{t('URL (creates PVC)')}</span>
        </SelectOption>
      );
    case SOURCE_TYPES.registrySource:
      return (
        <SelectOption
          value={SOURCE_TYPES.registrySource}
          description={t('Import content via container registry.')}
        >
          <span data-test-id={SOURCE_TYPES.registrySource}>{t('Registry (ContainerDisk)')}</span>
        </SelectOption>
      );
    case SOURCE_TYPES.uploadSource:
      return (
        <SelectOption
          value={SOURCE_TYPES.uploadSource}
          description={t('Upload new file using the "Upload data to Persistent Volume Claim" page')}
          onClick={() =>
            window
              .open(`/k8s/ns/${ns || DEFAULT_NAMESPACE}/persistentvolumeclaims/~new/data`, '_blank')
              .focus()
          }
        >
          {t('Upload (Upload a new file to a PVC)')} <ExternalLinkAltIcon />
        </SelectOption>
      );
    default:
      return;
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
  const { ns } = useParams<{ ns: string }>();

  const onSelect = React.useCallback(
    (event, selection) => {
      setIsOpen(false);

      if (selection !== SOURCE_TYPES.uploadSource) onSelectSource(selection);
    },
    [onSelectSource],
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
        placeholderText={t('Select boot source')}
        menuAppendTo="parent"
      >
        {<SelectOption key={0} value="Select a title" isPlaceholder /> &&
          options.map((option) => getSourceOption(option, ns))}
      </Select>
    </FormGroup>
  );
};

export default SelectSourceOption;
