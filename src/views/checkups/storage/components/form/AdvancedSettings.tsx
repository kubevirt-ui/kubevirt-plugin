import React, { type Dispatch, type JSX, type SetStateAction } from 'react';

import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type getDefaultStorageClass } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection, FormGroup, PopoverPosition, TextInput } from '@patternfly/react-core';

import NumOfVMsField from './NumOfVMsField';
import SkipTeardownField from './SkipTeardownField';
import StorageClassField from './StorageClassField';
import { type StorageCheckupAdvancedSettings } from './types';

export type { StorageCheckupAdvancedSettings } from './types';

type AdvancedSettingsProps = {
  defaultSC: ReturnType<typeof getDefaultStorageClass>;
  setSettings: Dispatch<SetStateAction<StorageCheckupAdvancedSettings>>;
  settings: StorageCheckupAdvancedSettings;
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageClassesError: Error;
  storageClassesLoaded: boolean;
};

const AdvancedSettings = ({
  defaultSC,
  setSettings,
  settings,
  storageClasses,
  storageClassesError,
  storageClassesLoaded,
}: AdvancedSettingsProps): JSX.Element => {
  const { t } = useKubevirtTranslation();

  const updateSetting = <K extends keyof StorageCheckupAdvancedSettings>(
    key: K,
    value: StorageCheckupAdvancedSettings[K],
  ): void => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ExpandableSection isIndented toggleText={t('Advanced settings')}>
      <StorageClassField
        defaultSC={defaultSC}
        onStorageClassChange={(value) => updateSetting('storageClass', value)}
        selectedStorageClass={settings.storageClass}
        storageClasses={storageClasses}
        storageClassesError={storageClassesError}
        storageClassesLoaded={storageClassesLoaded}
      />

      <FormGroup
        className="form-group-spacing"
        fieldId="vmi-timeout"
        label={t('VMI timeout (minutes)')}
        labelHelp={
          <HelpTextIcon
            bodyContent={t('Timeout for VMI operations (in minutes)')}
            buttonAriaLabel={t('Help for VMI timeout')}
            position={PopoverPosition.right}
          />
        }
      >
        <TextInput
          className="CheckupsStorageForm--main__number-input"
          id="vmi-timeout"
          min={1}
          name="vmi-timeout"
          onChange={(_event, value) => updateSetting('vmiTimeout', value)}
          placeholder={t('Default: 3 minutes')}
          type="number"
          value={settings.vmiTimeout}
        />
      </FormGroup>

      <NumOfVMsField
        onNumOfVMsChange={(value) => updateSetting('numOfVMs', value)}
        value={settings.numOfVMs}
      />

      <SkipTeardownField
        onSkipTeardownChange={(value) => updateSetting('skipTeardown', value)}
        skipTeardown={settings.skipTeardown}
      />
    </ExpandableSection>
  );
};

export default AdvancedSettings;
