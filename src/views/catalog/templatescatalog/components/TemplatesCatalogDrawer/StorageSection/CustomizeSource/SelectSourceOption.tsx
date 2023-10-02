import React, {
  FC,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
} from '../constants';

const sourceOptions = {
  [BLANK_SOURCE_NAME]: (
    <SelectOption
      description={t('Create a new blank PVC')}
      key={BLANK_SOURCE_NAME}
      value={BLANK_SOURCE_NAME}
    >
      <span data-test-id={BLANK_SOURCE_NAME}>{t('Blank')}</span>
    </SelectOption>
  ),
  [CONTAINER_DISK_SOURCE_NAME]: (
    <SelectOption
      description={t('Import content via container registry.')}
      key={CONTAINER_DISK_SOURCE_NAME}
      value={CONTAINER_DISK_SOURCE_NAME}
    >
      <span data-test-id={CONTAINER_DISK_SOURCE_NAME}>{t('Registry (ContainerDisk)')}</span>
    </SelectOption>
  ),
  [DEFAULT_SOURCE]: (
    <SelectOption
      description={t('Use the default Template disk source')}
      key={DEFAULT_SOURCE}
      value={DEFAULT_SOURCE}
    >
      <span data-test-id={DEFAULT_SOURCE}>{t('Template default')}</span>
    </SelectOption>
  ),
  [HTTP_SOURCE_NAME]: (
    <SelectOption
      description={t('Import content via URL (HTTP or HTTPS endpoint).')}
      key={HTTP_SOURCE_NAME}
      value={HTTP_SOURCE_NAME}
    >
      <span data-test-id={HTTP_SOURCE_NAME}>{t('URL (creates PVC)')}</span>
    </SelectOption>
  ),
  [PVC_SOURCE_NAME]: (
    <SelectOption
      description={t(
        'Select an existing persistent volume claim already available on the cluster and clone it.',
      )}
      key={PVC_SOURCE_NAME}
      value={PVC_SOURCE_NAME}
    >
      <span data-test-id={PVC_SOURCE_NAME}>{t('PVC (clone PVC)')}</span>
    </SelectOption>
  ),
  [REGISTRY_SOURCE_NAME]: (
    <SelectOption
      description={t('Import content via container registry.')}
      key={REGISTRY_SOURCE_NAME}
      value={REGISTRY_SOURCE_NAME}
    >
      <span data-test-id={REGISTRY_SOURCE_NAME}>{t('Registry (creates PVC)')}</span>
    </SelectOption>
  ),
  [UPLOAD_SOURCE_NAME]: (
    <SelectOption
      description={t('Upload a new file to a PVC. A new PVC will be created.')}
      key={UPLOAD_SOURCE_NAME}
      value={UPLOAD_SOURCE_NAME}
    >
      <span data-test-id={UPLOAD_SOURCE_NAME}>{t('Upload (Upload a new file to a PVC)')}</span>
    </SelectOption>
  ),
};

type SelectSourceOptionProps = {
  'data-test-id': string;
  label: ReactNode | string;
  onSelectSource: (selection: SOURCE_OPTIONS_IDS) => void;
  options: SOURCE_OPTIONS_IDS[];
  popOver?: ReactElement<any, JSXElementConstructor<any> | string>;
  selectedSource: SOURCE_OPTIONS_IDS;
};

const SelectSourceOption: FC<SelectSourceOptionProps> = ({
  'data-test-id': testId,
  label,
  onSelectSource,
  options,
  popOver,
  selectedSource,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = useCallback(
    (event, selection) => {
      setIsOpen(false);
      onSelectSource(selection);
    },
    [onSelectSource],
  );

  const optionComponents = useMemo(() => options.map((option) => sourceOptions[option]), [options]);

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
          menuAppendTo="parent"
          onSelect={onSelect}
          onToggle={setIsOpen}
          selections={selectedSource}
          toggleId={`${testId}-toggle`}
          variant={SelectVariant.single}
        >
          {optionComponents}
        </Select>
      </div>
    </FormGroup>
  );
};

export default SelectSourceOption;
