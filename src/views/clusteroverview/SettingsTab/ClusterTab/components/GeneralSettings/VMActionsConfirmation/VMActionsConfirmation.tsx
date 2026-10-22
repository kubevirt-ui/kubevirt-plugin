import React, { FC } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { CONFIRM_VM_ACTIONS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import ExpandSection from '@overview/SettingsTab/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@overview/SettingsTab/search/constants';

type VMActionsConfirmationProps = {
  newBadge: boolean;
};

const VMActionsConfirmation: FC<VMActionsConfirmationProps> = ({ newBadge }) => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const {
    featureEnabled: confirmVMActionsEnabled,
    loading,
    toggleFeature: toggleConfirmVMActionsEnabled,
  } = useFeatures(CONFIRM_VM_ACTIONS);

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.vmActionsConfirmation}
      toggleText={t('VirtualMachine actions confirmation')}
    >
      <SectionWithSwitch
        helpTextIconContent={(hide) => (
          <PopoverContentWithLightspeedButton
            content={t('Confirm requested VirtualMachine actions before executing them')}
            hide={hide}
            promptType={OLSPromptType.CONFIRM_VM_ACTIONS}
          />
        )}
        dataTestID="confirm-vm-actions"
        id="confirm-vm-actions"
        isDisabled={!isAdmin}
        isLoading={loading}
        newBadge={newBadge}
        switchIsOn={confirmVMActionsEnabled}
        title={t('Confirm VirtualMachine actions')}
        turnOnSwitch={toggleConfirmVMActionsEnabled}
      />
    </ExpandSection>
  );
};

export default VMActionsConfirmation;
