import * as React from 'react';
import { useParams } from 'react-router-dom-v5-compat';

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
          description={t('Use the default Template disk source')}
          value={SOURCE_TYPES.defaultSource}
        >
          <span data-test-id={SOURCE_TYPES.defaultSource}>{t('Default')}</span>
        </SelectOption>
      );
    case SOURCE_TYPES.pvcSource:
      return (
        <SelectOption
          description={t(
            'Select an existing persistent volume claim already available on the cluster and clone it.',
          )}
          value={SOURCE_TYPES.pvcSource}
        >
          <span data-test-id={SOURCE_TYPES.pvcSource}>{t('PVC (clone PVC)')}</span>
        </SelectOption>
      );
    case SOURCE_TYPES.httpSource:
      return (
        <SelectOption
          description={t('Import content via URL (HTTP or HTTPS endpoint).')}
          value={SOURCE_TYPES.httpSource}
        >
          <span data-test-id={SOURCE_TYPES.httpSource}>{t('URL (creates PVC)')}</span>
        </SelectOption>
      );
    case SOURCE_TYPES.registrySource:
      return (
        <SelectOption
          description={t('Import content via container registry.')}
          value={SOURCE_TYPES.registrySource}
        >
          <span data-test-id={SOURCE_TYPES.registrySource}>{t('Registry (ContainerDisk)')}</span>
        </SelectOption>
      );
    case SOURCE_TYPES.uploadSource:
      return (
        <SelectOption
          onClick={() =>
            window
              .open(`/k8s/ns/${ns || DEFAULT_NAMESPACE}/persistentvolumeclaims/~new/data`, '_blank')
              .focus()
          }
          description={t('Upload new file using the "Upload data to Persistent Volume Claim" page')}
          value={SOURCE_TYPES.uploadSource}
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
  options: SOURCE_OPTIONS_IDS[];
  selectedSource: SOURCE_OPTIONS_IDS;
};

const SelectSourceOption: React.FC<SelectSourceOptionProps> = ({
  label,
  onSelectSource,
  options,
  selectedSource,
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
      className="disk-source-form-group select-source-option"
      fieldId="disk-source-required-disk"
      isRequired
      label={label}
    >
      <Select
        isOpen={isOpen}
        maxHeight={400}
        menuAppendTo="parent"
        onSelect={onSelect}
        onToggle={setIsOpen}
        placeholderText={t('Select boot source')}
        selections={selectedSource}
        variant={SelectVariant.single}
      >
        {<SelectOption isPlaceholder key={0} value="Select a title" /> &&
          options.map((option) => getSourceOption(option, ns))}
      </Select>
    </FormGroup>
  );
};

export default SelectSourceOption;
