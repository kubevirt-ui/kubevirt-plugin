import React, { type FC, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { patchCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { Checkbox, Stack, StackItem } from '@patternfly/react-core';
import { USER_SETTINGS_URL } from '@settings/constants';
import { USER_TAB_IDS } from '@settings/search/constants';
import DefaultVMLabelRow from '@settings/tabs/UserTab/components/DefaultVMLabelsSection/components/DefaultVMLabelRow';

type RequiredVMLabelsDrawerBodyProps = {
  requiredLabels: AutoAppliedLabel[];
  vmLabels: Record<string, string>;
};

const RequiredVMLabelsDrawerBody: FC<RequiredVMLabelsDrawerBodyProps> = ({
  requiredLabels,
  vmLabels,
}) => {
  const { t } = useKubevirtTranslation();
  const [userDefaults, setUserDefaults] = useKubevirtUserSettings(
    USER_SETTINGS_KEYS.defaultVMLabels,
  );
  const [saveAsDefaults, setSaveAsDefaults] = useState(false);

  const labelsToShow = useMemo(
    () => requiredLabels.filter((label) => !label.value),
    [requiredLabels],
  );

  const handleSave = useCallback(
    (key: string, value: string): void => {
      patchCustomizeWizardVMSignal([{ data: value, path: ['metadata', 'labels', key] }]);

      if (saveAsDefaults) {
        void setUserDefaults({ ...(userDefaults || {}), [key]: value });
      }
    },
    [saveAsDefaults, setUserDefaults, userDefaults],
  );

  return (
    <Stack hasGutter>
      {labelsToShow.map((label) => (
        <StackItem key={label.key}>
          <DefaultVMLabelRow
            label={label}
            onValueChange={handleSave}
            userValue={vmLabels[label.key] ?? ''}
          />
        </StackItem>
      ))}

      <StackItem>
        <Checkbox
          id="save-as-defaults"
          isChecked={saveAsDefaults}
          label={t('Apply these values as defaults for every virtual machine I create')}
          onChange={(_event, checked) => setSaveAsDefaults(checked)}
        />
      </StackItem>

      <StackItem>
        <Link
          id="manage-in-user-settings-link"
          to={`${USER_SETTINGS_URL}#${USER_TAB_IDS.defaultVMLabels}`}
        >
          {t('Manage in User settings')}
        </Link>
      </StackItem>
    </Stack>
  );
};

export default RequiredVMLabelsDrawerBody;
