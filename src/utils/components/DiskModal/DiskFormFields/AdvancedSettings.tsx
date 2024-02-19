import React, { Dispatch, FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { FEATURE_HCO_PERSISTENT_RESERVATION } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { Checkbox, ExpandableSection, Split, Stack, StackItem } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';
import { DiskFormState } from '../state/initialState';

type AdvancedSettingsProps = {
  diskState: DiskFormState;
  dispatchDiskState: Dispatch<DiskReducerActionType>;
};

const AdvancedSettings: FC<AdvancedSettingsProps> = ({ diskState, dispatchDiskState }) => {
  const { t } = useKubevirtTranslation();

  const { featureEnabled } = useFeatures(FEATURE_HCO_PERSISTENT_RESERVATION);

  const isLunType = diskState.diskType === diskTypes.lun;
  return (
    <ExpandableSection toggleText={t('Advanced settings')}>
      <Stack hasGutter>
        <StackItem>
          <Split hasGutter>
            <Checkbox
              onChange={(_event, checked) =>
                dispatchDiskState({ payload: checked, type: diskReducerActions.SET_SHARABLE })
              }
              id="sharable-disk"
              isChecked={diskState.sharable || isLunType}
              isDisabled={diskState.lunReservation || isLunType}
              label={t('Share this disk between multiple VirtualMachines')}
            />
            <HelpTextIcon bodyContent={t('Allows concurrent access by multiple VirtualMachines')} />
          </Split>
        </StackItem>
        <StackItem>
          <Split hasGutter>
            <Checkbox
              onChange={(_event, checked) =>
                dispatchDiskState({
                  payload: checked,
                  type: diskReducerActions.SET_LUN_RESERVATION,
                })
              }
              id="lun-reservation"
              isChecked={diskState.lunReservation}
              isDisabled={diskState.sharable || !isLunType || !featureEnabled}
              label={t('Set SCSI reservation for disk')}
            />
            <HelpTextIcon
              bodyContent={t(
                'The disk must be attached to the VirtualMAchine as a SCSI LUN for this option to work. It should only be used for cluster-aware applications',
              )}
            />
          </Split>
        </StackItem>
      </Stack>
    </ExpandableSection>
  );
};

export default AdvancedSettings;
