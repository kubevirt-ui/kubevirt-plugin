import * as React from 'react';
import { TFunction } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

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

const getSourceOption = (source: SOURCE_OPTIONS_IDS, ns: string, t: TFunction) => {
  switch (source) {
    case DEFAULT_SOURCE:
      return (
        <SelectOption
          description={t('Use the default Template disk source')}
          key={DEFAULT_SOURCE}
          value={DEFAULT_SOURCE}
        >
          <span data-test-id={DEFAULT_SOURCE}>{t('Template default')}</span>
        </SelectOption>
      );
    case PVC_SOURCE_NAME:
      return (
        <SelectOption
          description={t(
            'Select an existing persistent volume claim already available on the cluster and clone it.',
          )}
          key={PVC_SOURCE_NAME}
          value={PVC_SOURCE_NAME}
        >
          <span data-test-id={PVC_SOURCE_NAME}>{t('PVC (clone PVC)')}</span>
        </SelectOption>
      );
    case HTTP_SOURCE_NAME:
      return (
        <SelectOption
          description={t('Import content via URL (HTTP or HTTPS endpoint).')}
          key={HTTP_SOURCE_NAME}
          value={HTTP_SOURCE_NAME}
        >
          <span data-test-id={HTTP_SOURCE_NAME}>{t('URL (creates PVC)')}</span>
        </SelectOption>
      );
    case REGISTRY_SOURCE_NAME:
      return (
        <SelectOption
          description={t('Import content via container registry.')}
          key={REGISTRY_SOURCE_NAME}
          value={REGISTRY_SOURCE_NAME}
        >
          <span data-test-id={REGISTRY_SOURCE_NAME}>{t('Registry (creates PVC)')}</span>
        </SelectOption>
      );
    case CONTAINER_DISK_SOURCE_NAME:
      return (
        <SelectOption
          description={t('Import content via container registry.')}
          key={REGISTRY_SOURCE_NAME}
          value={REGISTRY_SOURCE_NAME}
        >
          <span data-test-id={REGISTRY_SOURCE_NAME}>{t('Registry (ContainerDisk)')}</span>
        </SelectOption>
      );
    case UPLOAD_SOURCE_NAME:
      return (
        <SelectOption
          description={t('Upload a new file to a PVC. A new PVC will be created.')}
          key={UPLOAD_SOURCE_NAME}
          value={UPLOAD_SOURCE_NAME}
        >
          {t('Upload (Upload a new file to a PVC)')}
        </SelectOption>
      );
    case BLANK_SOURCE_NAME:
      return (
        <SelectOption
          description={t('Create a new blank PVC')}
          key={BLANK_SOURCE_NAME}
          value={BLANK_SOURCE_NAME}
        >
          <span data-test-id={BLANK_SOURCE_NAME}>{t('Blank')}</span>
        </SelectOption>
      );
    default:
      break;
  }
};

type SelectSourceOptionProps = {
  'data-test-id': string;
  label: React.ReactNode | string;
  onSelectSource: (selection: SOURCE_OPTIONS_IDS) => void;
  options: SOURCE_OPTIONS_IDS[];
  popOver?: React.ReactElement<any, React.JSXElementConstructor<any> | string>;
  selectedSource: SOURCE_OPTIONS_IDS;
};

const SelectSourceOption: React.FC<SelectSourceOptionProps> = ({
  'data-test-id': testId,
  label,
  onSelectSource,
  options,
  popOver,
  selectedSource,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { ns } = useParams<{ ns: string }>();
  const { t } = useKubevirtTranslation();

  const onSelect = React.useCallback(
    (event, selection) => {
      setIsOpen(false);
      onSelectSource(selection);
    },
    [onSelectSource],
  );

  return (
    <FormGroup
      className="disk-source-form-group select-source-option"
      fieldId={testId}
      isRequired
      label={label}
      labelIcon={popOver}
    >
      <div data-test-id={testId}>
        <Select
          data-test-id={testId}
          id={testId}
          isOpen={isOpen}
          maxHeight={400}
          onSelect={onSelect}
          onToggle={setIsOpen}
          selections={selectedSource}
          toggleId={`${testId}-toggle`}
          variant={SelectVariant.single}
        >
          {options.map((option) => getSourceOption(option, ns, t))}
        </Select>
      </div>
    </FormGroup>
  );
};

export default SelectSourceOption;
