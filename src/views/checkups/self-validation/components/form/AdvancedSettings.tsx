import React, { type FC, useCallback, useEffect } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ExpandableSection,
  FormGroup,
  HelperText,
  HelperTextItem,
  type SelectProps,
  TextInput,
} from '@patternfly/react-core';

import StorageCapabilityFields from './StorageCapabilityFields';
import StorageClassFields from './StorageClassFields';
import { type AdvancedSettingsProps } from './types';
import useSelfValidationFormStorage from './useSelfValidationFormStorage';
import { addStorageCapability, removeStorageCapability } from './utils';

const AdvancedSettings: FC<AdvancedSettingsProps> = ({
  cluster,
  isDryRun,
  onStorageChange,
  selectedTestSuites,
  setIsDryRun,
  setTestSkips,
  testSkips,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    claimPropertySetsLength,
    effectiveStorageClass,
    pvcSize,
    setPvcSize,
    setStorageCapabilities,
    setStorageClass,
    storageCapabilities,
    storageClasses,
    storageClassesLoaded,
    storageProfileError,
    storageProfileLoaded,
  } = useSelfValidationFormStorage(selectedTestSuites, cluster);

  useEffect((): void => {
    onStorageChange({
      pvcSize,
      storageCapabilities,
      storageClass: effectiveStorageClass,
    });
  }, [effectiveStorageClass, onStorageChange, pvcSize, storageCapabilities]);

  const handleStorageCapabilitySelect: SelectProps['onSelect'] = useCallback(
    (_event, value: string): void => {
      setStorageCapabilities((prev) =>
        prev.includes(value)
          ? removeStorageCapability(prev, value)
          : addStorageCapability(prev, value),
      );
    },
    [setStorageCapabilities],
  );

  return (
    <ExpandableSection isIndented toggleText={t('Advanced settings')}>
      <StorageClassFields
        afterPvc={
          <StorageCapabilityFields
            effectiveStorageClassName={effectiveStorageClass}
            onSelect={handleStorageCapabilitySelect}
            storageCapabilities={storageCapabilities}
            storageProfileError={storageProfileError}
            storageProfileHasClaimPropertySets={claimPropertySetsLength > 0}
            storageProfileLoaded={storageProfileLoaded}
          />
        }
        afterStorageClass={
          <FormGroup className="form-group-spacing" fieldId="test-skips" label={t('Test skips')}>
            <TextInput
              id="test-skips"
              name="test-skips"
              onChange={(_event, value): void => setTestSkips(value)}
              value={testSkips}
            />
            <HelperText className="checkups-self-validation-form__helper-text">
              <HelperTextItem>
                {t('Pipe-separated list of tests to skip (e.g., test_id:1783|test_id:1853)')}
              </HelperTextItem>
            </HelperText>
          </FormGroup>
        }
        effectiveStorageClassName={effectiveStorageClass}
        isDryRun={isDryRun}
        pvcSize={pvcSize}
        setIsDryRun={setIsDryRun}
        setPvcSize={setPvcSize}
        setStorageClass={setStorageClass}
        storageClasses={storageClasses}
        storageClassesLoaded={storageClassesLoaded}
      />
    </ExpandableSection>
  );
};

export default AdvancedSettings;
