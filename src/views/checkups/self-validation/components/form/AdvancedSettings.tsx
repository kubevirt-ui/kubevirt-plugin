import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import CheckboxSelect from '@kubevirt-utils/components/CheckboxSelect/CheckboxSelect';
import { getSCSelectOptions } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { StorageClassModel } from '@kubevirt-utils/models';
import {
  ExpandableSection,
  FormGroup,
  HelperText,
  HelperTextItem,
  PopoverPosition,
  Switch,
  TextInput,
} from '@patternfly/react-core';

import { STORAGE_CAPABILITY_OPTIONS } from '../../utils';

import { AdvancedSettingsProps } from './types';

const AdvancedSettings: FC<AdvancedSettingsProps> = ({
  effectiveStorageClassName,
  handleStorageCapabilitySelect,
  isDryRun,
  pvcSize,
  setIsDryRun,
  setPvcSize,
  setStorageClass,
  setTestSkips,
  storageCapabilities,
  storageClasses,
  storageClassesLoaded,
  storageProfileError,
  storageProfileHasClaimPropertySets,
  storageProfileLoaded,
  testSkips,
}) => {
  const { t } = useKubevirtTranslation();

  const showStorageProfilePrefilledHint =
    storageProfileLoaded &&
    !storageProfileError &&
    storageProfileHasClaimPropertySets &&
    Boolean(effectiveStorageClassName);

  const showStorageProfileManualFallbackHint =
    storageProfileLoaded &&
    effectiveStorageClassName &&
    (storageProfileError || !storageProfileHasClaimPropertySets);

  return (
    <ExpandableSection isIndented toggleText={t('Advanced settings')}>
      <FormGroup className="form-group-spacing" fieldId="storage-class" label={t('Storage class')}>
        {storageClassesLoaded ? (
          <InlineFilterSelect
            toggleProps={{
              isFullWidth: true,
            }}
            options={getSCSelectOptions(storageClasses)}
            placeholder={t('Select {{label}}', { label: StorageClassModel.label })}
            popperProps={{ enableFlip: true }}
            selected={effectiveStorageClassName}
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
          value={testSkips}
        />
        <HelperText className="checkups-self-validation-form__helper-text">
          <HelperTextItem>
            {t('Pipe-separated list of tests to skip (e.g., test_id:1783|test_id:1853)')}
          </HelperTextItem>
        </HelperText>
      </FormGroup>
      <FormGroup className="form-group-spacing" fieldId="pvc-size" label={t('PVC size')}>
        <CapacityInput onChange={setPvcSize} size={pvcSize} />
      </FormGroup>
      <FormGroup
        labelHelp={
          <HelpTextIcon
            bodyContent={
              <Trans ns="plugin__kubevirt-plugin" t={t}>
                Select the storage capabilities your storage class supports. Check the{' '}
                <ExternalLink hideIcon href={documentationURL.STORAGE_PROFILES}>
                  StorageProfile
                </ExternalLink>{' '}
                to see supported access and volume modes. Note: Storage Snapshot must be selected
                for snapshot tests to run.
              </Trans>
            }
            position={PopoverPosition.right}
          />
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
        {(showStorageProfilePrefilledHint || showStorageProfileManualFallbackHint) && (
          <div aria-live="polite" className="pf-v6-u-pt-sm">
            {showStorageProfilePrefilledHint && (
              <HelperText className="checkups-self-validation-form__helper-text">
                <HelperTextItem variant="default">
                  <Trans ns="plugin__kubevirt-plugin" t={t}>
                    Access and volume mode capabilities were pre-filled from the StorageProfile for
                    storage class <strong>{{ storageClassName: effectiveStorageClassName }}</strong>
                    .
                    <br />
                    You can override them if needed.
                  </Trans>
                </HelperTextItem>
              </HelperText>
            )}
            {showStorageProfileManualFallbackHint && (
              <HelperText className="checkups-self-validation-form__helper-text">
                <HelperTextItem variant="warning">
                  {t(
                    'StorageProfile data is not available for this storage class. Select storage capabilities manually.',
                  )}
                </HelperTextItem>
              </HelperText>
            )}
          </div>
        )}
      </FormGroup>
      <Switch
        label={
          <>
            <span className="pf-v6-c-form__label-text">{t('Dry run')}</span>
            <HelpTextIcon
              bodyContent={t(
                'Run the validation in dry run mode (no actual tests will be executed)',
              )}
              helpIconClassName="pf-v6-u-ml-sm"
              position={PopoverPosition.right}
            />
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
