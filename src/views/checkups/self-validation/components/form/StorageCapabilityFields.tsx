// Extracted from CheckupsSelfValidationForm.tsx
// Root: src/views/checkups/self-validation/components/form/CheckupsSelfValidationForm.tsx

import { type FC } from 'react';
import { Trans } from 'react-i18next';

import CheckboxSelect from '@kubevirt-utils/components/CheckboxSelect/CheckboxSelect';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FormGroup,
  HelperText,
  HelperTextItem,
  PopoverPosition,
  type SelectProps,
} from '@patternfly/react-core';

import { STORAGE_CAPABILITY_OPTIONS } from '../../utils';

type StorageCapabilityFieldsProps = {
  effectiveStorageClassName: string;
  onSelect: SelectProps['onSelect'];
  storageCapabilities: string[];
  storageProfileError: boolean;
  storageProfileHasClaimPropertySets: boolean;
  storageProfileLoaded: boolean;
};

const StorageCapabilityFields: FC<StorageCapabilityFieldsProps> = ({
  effectiveStorageClassName,
  onSelect,
  storageCapabilities,
  storageProfileError,
  storageProfileHasClaimPropertySets,
  storageProfileLoaded,
}) => {
  const { t } = useKubevirtTranslation();
  const showPrefilledHint =
    storageProfileLoaded &&
    !storageProfileError &&
    storageProfileHasClaimPropertySets &&
    Boolean(effectiveStorageClassName);
  const showManualFallbackHint =
    storageProfileLoaded &&
    Boolean(effectiveStorageClassName) &&
    (storageProfileError || !storageProfileHasClaimPropertySets);

  return (
    <FormGroup
      className="form-group-spacing storage-capabilities"
      fieldId="storage-capabilities"
      label={t('Storage capabilities')}
      labelHelp={
        <HelpTextIcon
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              Select the storage capabilities your storage class supports. Check the{' '}
              <ExternalLink hideIcon href={documentationURL.STORAGE_PROFILES}>
                StorageProfile
              </ExternalLink>{' '}
              to see supported access and volume modes. Note: Storage Snapshot must be selected for
              snapshot tests to run.
            </Trans>
          }
          position={PopoverPosition.right}
        />
      }
    >
      <CheckboxSelect
        onSelect={onSelect}
        options={STORAGE_CAPABILITY_OPTIONS.map((option) => ({
          children: option.label,
          isSelected: storageCapabilities.includes(option.value),
          value: option.value,
        }))}
        selectedValues={storageCapabilities}
        toggleTitle={t('Storage capabilities')}
      />
      {(showPrefilledHint || showManualFallbackHint) && (
        <div aria-live="polite" className="pf-v6-u-pt-sm">
          {showPrefilledHint && (
            <HelperText className="checkups-self-validation-form__helper-text">
              <HelperTextItem variant="default">
                <Trans ns="plugin__kubevirt-plugin" t={t}>
                  Access and volume mode capabilities were pre-filled from the StorageProfile for
                  storage class <strong>{{ storageClassName: effectiveStorageClassName }}</strong>.
                  <br />
                  You can override them if needed.
                </Trans>
              </HelperTextItem>
            </HelperText>
          )}
          {showManualFallbackHint && (
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
  );
};

export default StorageCapabilityFields;
