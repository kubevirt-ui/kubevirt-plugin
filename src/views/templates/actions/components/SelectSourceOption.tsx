import React, { type FC, type JSX, type ReactNode, useCallback } from 'react';
import { useParams } from 'react-router';
import { type TFunction } from 'i18next';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, SelectOption } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { SOURCE_TYPE_LABELS, SOURCE_TYPES, type SourceOptionsIds } from '../../utils/constants';

const getSourceOption = (
  source: SourceOptionsIds,
  ns: string,
  t: TFunction,
): JSX.Element | undefined => {
  switch (source) {
    case SOURCE_TYPES.defaultSource:
      return (
        <SelectOption
          description={t('Use the default Template disk source')}
          value={SOURCE_TYPES.defaultSource}
        >
          <span data-test={SOURCE_TYPES.defaultSource}>{t('Default')}</span>
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
          <span data-test={SOURCE_TYPES.pvcSource}>{t('PVC (clone PVC)')}</span>
        </SelectOption>
      );
    case SOURCE_TYPES.httpSource:
      return (
        <SelectOption
          description={t('Import content via URL (HTTP or HTTPS endpoint).')}
          value={SOURCE_TYPES.httpSource}
        >
          <span data-test={SOURCE_TYPES.httpSource}>{t('URL (creates PVC)')}</span>
        </SelectOption>
      );
    case SOURCE_TYPES.registrySource:
      return (
        <SelectOption
          description={t('Import content via container registry.')}
          value={SOURCE_TYPES.registrySource}
        >
          <span data-test={SOURCE_TYPES.registrySource}>{t('Registry (ContainerDisk)')}</span>
        </SelectOption>
      );
    case SOURCE_TYPES.uploadSource:
      return (
        <SelectOption
          description={t('Upload new file using the "Upload data to PersistentVolumeClaim" page')}
          onClick={() =>
            window
              .open(`/k8s/ns/${ns || DEFAULT_NAMESPACE}/persistentvolumeclaims/~new/data`, '_blank')
              .focus()
          }
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
  label: ReactNode;
  onSelectSource: (selection: SourceOptionsIds) => void;
  options: SourceOptionsIds[];
  selectedSource: SourceOptionsIds;
};

const SelectSourceOption: FC<SelectSourceOptionProps> = ({
  label,
  onSelectSource,
  options,
  selectedSource,
}) => {
  const { t } = useKubevirtTranslation();
  const { ns } = useParams<{ ns: string }>();

  const onSelect = useCallback(
    (_event, selection) => {
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
      <FormPFSelect
        onSelect={onSelect}
        placeholder={t('Select boot source type')}
        selected={selectedSource}
        selectedLabel={selectedSource ? t(SOURCE_TYPE_LABELS[selectedSource]) : undefined}
      >
        {options.map((option) => getSourceOption(option, ns, t))}
      </FormPFSelect>
    </FormGroup>
  );
};

export default SelectSourceOption;
