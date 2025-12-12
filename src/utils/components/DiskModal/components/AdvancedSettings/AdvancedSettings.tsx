import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { FEATURE_HCO_PERSISTENT_RESERVATION } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import LightspeedSimplePopoverContent from '@lightspeed/components/LightspeedSimplePopoverContent';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Checkbox, ExpandableSection, Split, Stack, StackItem } from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import ApplyStorageProfileSettings from '../StorageProfileSettings/ApplyStorageProfileSettings';
import { LUN_RESERVATION_FIELD, SHARABLE_FIELD } from '../utils/constants';
import { getDiskSharable, getLunReservation } from '../utils/selectors';

type AdvancedSettingsProps = {
  olsObj: K8sResourceCommon;
  showApplyStorageProfileSettings?: boolean;
};

const AdvancedSettings: FC<AdvancedSettingsProps> = ({
  olsObj,
  showApplyStorageProfileSettings,
}) => {
  const { t } = useKubevirtTranslation();
  const { control, setValue, watch } = useFormContext<V1DiskFormState>();
  const disk = watch('disk');

  const diskType = getDiskDrive(disk);

  const sharable = getDiskSharable(disk);
  const lunReservation = getLunReservation(disk);

  const { featureEnabled } = useFeatures(FEATURE_HCO_PERSISTENT_RESERVATION);

  const isLunType = diskType === diskTypes.lun;
  return (
    <ExpandableSection isIndented toggleText={t('Advanced settings')}>
      <Stack hasGutter>
        {showApplyStorageProfileSettings && <ApplyStorageProfileSettings />}
        <StackItem>
          <Split hasGutter>
            <Controller
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  id="sharable-disk"
                  isChecked={value || isLunType}
                  isDisabled={lunReservation || isLunType}
                  label={t('Share this disk between multiple VirtualMachines')}
                  onChange={(_event, checked) => onChange(checked)}
                />
              )}
              control={control}
              name={SHARABLE_FIELD}
            />
            <HelpTextIcon
              bodyContent={(hide) => (
                <LightspeedSimplePopoverContent
                  content={t('Allows concurrent access by multiple VirtualMachines')}
                  hide={hide}
                  obj={olsObj}
                  promptType={OLSPromptType.SHARE_THIS_DISK_BETWEEN_MULTI_VMS}
                />
              )}
            />
          </Split>
        </StackItem>
        <StackItem>
          <Split hasGutter>
            <Checkbox
              id="lun-reservation"
              isChecked={disk?.lun?.reservation}
              isDisabled={sharable || !isLunType || !featureEnabled}
              label={t('Set SCSI reservation for disk')}
              onChange={(_event, checked) => setValue(LUN_RESERVATION_FIELD, checked)}
            />
            <HelpTextIcon
              bodyContent={(hide) => (
                <LightspeedSimplePopoverContent
                  content={t(
                    'The disk must be attached to the VirtualMachine as a SCSI LUN for this option to work. It should only be used for cluster-aware applications',
                  )}
                  hide={hide}
                  obj={olsObj}
                  promptType={OLSPromptType.SET_SCSI_RESERVATION_FOR_DISK}
                />
              )}
            />
          </Split>
        </StackItem>
      </Stack>
    </ExpandableSection>
  );
};

export default AdvancedSettings;
