import React, { Dispatch, FC, SetStateAction, useMemo } from 'react';
import { Trans } from 'react-i18next';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  getDefaultStorageClass,
  getSCSelectOptions,
} from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { StorageClassModel } from '@kubevirt-utils/models';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  ExpandableSection,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
  PopoverPosition,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { SimpleSelect } from '@patternfly/react-templates';

import {
  getSkipTeardownOptions,
  isNumOfVMsInvalid,
  NUM_OF_VMS_MAX,
  NUM_OF_VMS_MIN,
  SkipTeardownOption,
} from '../../utils/utils';

export type StorageCheckupAdvancedSettings = {
  numOfVMs: string;
  skipTeardown: SkipTeardownOption;
  storageClass: string;
  vmiTimeout: string;
};

type AdvancedSettingsProps = {
  defaultSC: ReturnType<typeof getDefaultStorageClass>;
  setSettings: Dispatch<SetStateAction<StorageCheckupAdvancedSettings>>;
  settings: StorageCheckupAdvancedSettings;
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageClassesError: Error;
  storageClassesLoaded: boolean;
};

const AdvancedSettings: FC<AdvancedSettingsProps> = ({
  defaultSC,
  setSettings,
  settings,
  storageClasses,
  storageClassesError,
  storageClassesLoaded,
}) => {
  const { t } = useKubevirtTranslation();

  const updateSetting = <K extends keyof StorageCheckupAdvancedSettings>(
    key: K,
    value: StorageCheckupAdvancedSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const skipTeardownOptions = useMemo(() => getSkipTeardownOptions(t), [t]);

  return (
    <ExpandableSection isIndented toggleText={t('Advanced settings')}>
      <FormGroup className="form-group-spacing" fieldId="storage-class" label={t('Storage class')}>
        {storageClassesLoaded ? (
          <InlineFilterSelect
            toggleProps={{
              isFullWidth: true,
              placeholder: t('Select {{label}}', { label: StorageClassModel.label }),
            }}
            options={getSCSelectOptions(storageClasses) ?? []}
            popperProps={{ enableFlip: true }}
            selected={settings.storageClass || defaultSC?.metadata?.name || ''}
            setSelected={(value) => updateSetting('storageClass', value)}
          />
        ) : (
          <Loading />
        )}
        {storageClassesError && (
          <Alert
            className="form-group-spacing"
            isInline
            title={t('Failed to load storage classes')}
            variant={AlertVariant.danger}
          >
            {storageClassesError?.message}
          </Alert>
        )}
      </FormGroup>

      <FormGroup
        labelHelp={
          <Popover
            bodyContent={t('Timeout for VMI operations (in minutes)')}
            position={PopoverPosition.right}
          >
            <Button
              aria-label={t('Help for VMI timeout')}
              hasNoPadding
              icon={<HelpIcon />}
              variant={ButtonVariant.plain}
            />
          </Popover>
        }
        className="form-group-spacing"
        fieldId="vmi-timeout"
        label={t('VMI timeout (minutes)')}
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

      <FormGroup
        labelHelp={
          <Popover
            bodyContent={t('Number of concurrent VMs to boot for testing')}
            position={PopoverPosition.right}
          >
            <Button
              aria-label={t('Help for number of VMs')}
              hasNoPadding
              icon={<HelpIcon />}
              variant={ButtonVariant.plain}
            />
          </Popover>
        }
        className="form-group-spacing"
        fieldId="num-of-vms"
        label={t('Number of VMs')}
      >
        <TextInput
          validated={
            isNumOfVMsInvalid(settings.numOfVMs) ? ValidatedOptions.error : ValidatedOptions.default
          }
          className="CheckupsStorageForm--main__number-input"
          id="num-of-vms"
          max={NUM_OF_VMS_MAX}
          min={NUM_OF_VMS_MIN}
          name="num-of-vms"
          onChange={(_event, value) => updateSetting('numOfVMs', value)}
          placeholder={t('Default: 10')}
          type="number"
          value={settings.numOfVMs}
        />
        {isNumOfVMsInvalid(settings.numOfVMs) && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant="error">
                {t('Number of VMs must be a number between {{min}} and {{max}}', {
                  max: NUM_OF_VMS_MAX,
                  min: NUM_OF_VMS_MIN,
                })}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>

      <FormGroup
        labelHelp={
          <Popover
            bodyContent={t(
              'Controls whether the teardown steps should be skipped after checkup completion',
            )}
            position={PopoverPosition.right}
          >
            <Button
              aria-label={t('Help for skip teardown')}
              hasNoPadding
              icon={<HelpIcon />}
              variant={ButtonVariant.plain}
            />
          </Popover>
        }
        className="form-group-spacing"
        fieldId="skip-teardown"
        label={t('Skip teardown')}
      >
        <SimpleSelect
          id="skip-teardown"
          initialOptions={skipTeardownOptions}
          onSelect={(_, value: SkipTeardownOption) => updateSetting('skipTeardown', value)}
          selected={settings.skipTeardown}
        />
      </FormGroup>

      {settings.skipTeardown !== 'never' && (
        <Alert
          className="form-group-spacing"
          isInline
          title={t('Warning: Manual cleanup required')}
          variant={AlertVariant.warning}
        >
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            When teardown is skipped, you will be responsible for manually cleaning up the
            VirtualMachines, DataVolumes, and PersistentVolumeClaims created by the checkup job.
          </Trans>
        </Alert>
      )}
    </ExpandableSection>
  );
};

export default AdvancedSettings;
