import { type FC, useCallback, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Link } from 'react-router';
import produce from 'immer';

import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Checkbox, Stack, StackItem } from '@patternfly/react-core';
import { USER_SETTINGS_URL } from '@settings/constants';
import { USER_TAB_IDS } from '@settings/search/constants';
import DefaultVMLabelRow from '@settings/tabs/UserTab/components/DefaultVMLabelsSection/components/DefaultVMLabelRow';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

type RequiredVMLabelsDrawerBodyProps = {
  requiredLabels: AutoAppliedLabel[];
};

const RequiredVMLabelsDrawerBody: FC<RequiredVMLabelsDrawerBodyProps> = ({ requiredLabels }) => {
  const { t } = useKubevirtTranslation();
  const { replaceDraft, vmDraft } = useWizardVMDraft();
  const { control } = useVMWizardForm();
  const cluster = useWatch({ control, name: 'deployment.cluster' });
  const [userDefaults, setUserDefaults] = useKubevirtUserSettings(
    USER_SETTINGS_KEYS.defaultVMLabels,
    cluster,
  );
  const [saveAsDefaults, setSaveAsDefaults] = useState(false);
  const labelsToShow = useMemo(
    () => requiredLabels.filter((label) => !label.value),
    [requiredLabels],
  );

  const handleSave = useCallback(
    (key: string, value: string): void => {
      if (!vmDraft) return;
      replaceDraft(
        produce(vmDraft, (draft) => {
          ensurePath(draft, ['metadata.labels']);

          draft.metadata.labels[key] = value;
        }),
        vmDraft,
      );

      if (saveAsDefaults) {
        void setUserDefaults({ ...(userDefaults || {}), [key]: value });
      }
    },
    [replaceDraft, saveAsDefaults, setUserDefaults, userDefaults, vmDraft],
  );

  return (
    <Stack hasGutter>
      {labelsToShow.map((label) => (
        <StackItem key={label.key}>
          <DefaultVMLabelRow
            label={label}
            onValueChange={handleSave}
            userValue={vmDraft?.metadata?.labels?.[label.key] ?? ''}
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
