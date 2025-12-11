import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import CheckboxSelect from '@kubevirt-utils/components/CheckboxSelect/CheckboxSelect';
import {
  getDefaultStorageClass,
  getSCSelectOptions,
} from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { StorageClassModel } from '@kubevirt-utils/models';
import {
  Button,
  ButtonVariant,
  ExpandableSection,
  FormGroup,
  Popover,
  PopoverPosition,
  SelectProps,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { STORAGE_CAPABILITY_OPTIONS } from '../../utils';

type AdvancedSettingsProps = {
  defaultSC: ReturnType<typeof getDefaultStorageClass>;
  handleStorageCapabilitySelect: SelectProps['onSelect'];
  isDryRun: boolean;
  pvcSize: string;
  setIsDryRun: (checked: boolean) => void;
  setPvcSize: (size: string) => void;
  setStorageClass: (storageClass: string) => void;
  setTestSkips: (testSkips: string) => void;
  storageCapabilities: string[];
  storageClass: string;
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageClassesLoaded: boolean;
  testSkips: string;
};

const AdvancedSettings: FC<AdvancedSettingsProps> = ({
  defaultSC,
  handleStorageCapabilitySelect,
  isDryRun,
  pvcSize,
  setIsDryRun,
  setPvcSize,
  setStorageClass,
  setTestSkips,
  storageCapabilities,
  storageClass,
  storageClasses,
  storageClassesLoaded,
  testSkips,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandableSection isIndented toggleText={t('Advanced settings')}>
      <FormGroup className="form-group-spacing" fieldId="storage-class" label={t('Storage class')}>
        {storageClassesLoaded ? (
          <InlineFilterSelect
            toggleProps={{
              isFullWidth: true,
              placeholder: t('Select {{label}}', { label: StorageClassModel.label }),
            }}
            options={getSCSelectOptions(storageClasses)}
            popperProps={{ enableFlip: true }}
            selected={storageClass || defaultSC?.metadata?.name || ''}
            setSelected={setStorageClass}
          />
        ) : (
          <Loading />
        )}
      </FormGroup>
      <FormGroup className="form-group-spacing" fieldId="test-skips" label={t('Test skips')}>
        <TextInput
          id="test-skips"
          name="test-skips"
          onChange={(_event, value) => setTestSkips(value)}
          placeholder={t('Pipe-separated list of tests to skip (e.g., test_id:1783|test_id:1853)')}
          value={testSkips}
        />
      </FormGroup>
      <FormGroup className="form-group-spacing" fieldId="pvc-size" label={t('PVC size')}>
        <CapacityInput onChange={setPvcSize} size={pvcSize} />
      </FormGroup>
      <FormGroup
        labelHelp={
          <Popover
            bodyContent={
              <Trans ns="plugin__kubevirt-plugin" t={t}>
                Select the storage capabilities your storage class supports. Check the{' '}
                <a
                  href={documentationURL.STORAGE_PROFILES}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  StorageProfile
                </a>{' '}
                to see supported access and volume modes. Note: Storage Snapshot must be selected
                for snapshot tests to run.
              </Trans>
            }
            position={PopoverPosition.right}
          >
            <Button hasNoPadding icon={<HelpIcon />} variant={ButtonVariant.plain} />
          </Popover>
        }
        className="form-group-spacing storage-capabilities"
        fieldId="storage-capabilities"
        label={t('Storage capabilities')}
      >
        <CheckboxSelect
          options={STORAGE_CAPABILITY_OPTIONS.map((option) => ({
            children: option.label,
            isSelected: storageCapabilities.includes(option.value),
            value: option.value,
          }))}
          onSelect={handleStorageCapabilitySelect}
          selectedValues={storageCapabilities}
          toggleTitle={t('Storage capabilities')}
        />
      </FormGroup>
      <Switch
        label={
          <>
            <span className="pf-v6-c-form__label-text">{t('Dry run')}</span>
            <Popover
              bodyContent={t(
                'Run the validation in dry run mode (no actual tests will be executed)',
              )}
              position={PopoverPosition.right}
            >
              <Button icon={<HelpIcon />} variant={ButtonVariant.plain} />
            </Popover>
          </>
        }
        id="dry-run"
        isChecked={isDryRun}
        isReversed={true}
        onChange={(_event, checked) => setIsDryRun(checked)}
      />
    </ExpandableSection>
  );
};

export default AdvancedSettings;
