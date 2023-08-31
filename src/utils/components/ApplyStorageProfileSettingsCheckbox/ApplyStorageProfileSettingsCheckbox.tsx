import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Checkbox, FormGroup } from '@patternfly/react-core';

type ApplyStorageProfileSettingsCheckboxProps = {
  claimPropertySets: ClaimPropertySets;
  disabled?: boolean;
  handleChange: (checked: boolean) => void;
  isChecked: boolean;
};

const ApplyStorageProfileSettingsCheckbox: FC<ApplyStorageProfileSettingsCheckboxProps> = ({
  claimPropertySets,
  disabled,
  handleChange,
  isChecked,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup
      helperText={
        isEmpty(claimPropertySets)
          ? t('No optimized StorageProfile settings for this StorageClass.')
          : t('Optimized values Access mode: {{accessMode}}, Volume mode: {{volumeMode}}.', {
              accessMode: claimPropertySets?.[0]?.accessModes[0],
              volumeMode: claimPropertySets?.[0]?.volumeMode,
            })
      }
      fieldId="apply-storage-profile-settings"
      isInline
    >
      <Checkbox
        id="apply-storage-profile-settings"
        isChecked={isChecked}
        isDisabled={disabled}
        label={t('Apply optimized StorageProfile settings')}
        onChange={handleChange}
      />
    </FormGroup>
  );
};

export default ApplyStorageProfileSettingsCheckbox;
