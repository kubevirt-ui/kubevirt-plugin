import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { FEATURE_HCO_PERSISTENT_RESERVATION } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { Checkbox, ExpandableSection, Split, Stack, StackItem } from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import ApplyStorageProfileSettings from '../StorageProfileSettings/ApplyStorageProfileSettings';
import { LUN_RESERVATION_FIELD, SHARABLE_FIELD } from '../utils/constants';
import { getDiskSharable, getLunReservation } from '../utils/selectors';

type AdvancedSettingsProps = {
  showApplyStorageProfileSettings?: boolean;
};

const AdvancedSettings: FC<AdvancedSettingsProps> = ({ showApplyStorageProfileSettings }) => {
  const { t } = useKubevirtTranslation();
  const { control, setValue, watch } = useFormContext<V1DiskFormState>();
  const disk = watch('disk');

  const diskType = getDiskDrive(disk);

  const sharable = getDiskSharable(disk);
  const lunReservation = getLunReservation(disk);

  const { featureEnabled } = useFeatures(FEATURE_HCO_PERSISTENT_RESERVATION);

  const isLunType = diskType === diskTypes.lun;
  return (
    <Stack hasGutter>
      {showApplyStorageProfileSettings && <ApplyStorageProfileSettings />}
      <ExpandableSection isIndented toggleText={t('Advanced settings')}>
        <Stack hasGutter>
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
                bodyContent={t('Allows concurrent access by multiple VirtualMachines')}
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
                bodyContent={t(
                  'The disk must be attached to the VirtualMachine as a SCSI LUN for this option to work. It should only be used for cluster-aware applications',
                )}
              />
            </Split>
          </StackItem>
        </Stack>
      </ExpandableSection>
    </Stack>
  );
};

export default AdvancedSettings;
