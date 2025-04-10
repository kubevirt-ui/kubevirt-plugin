import React, { FC } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { CONFIRM_VM_ACTIONS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import ExpandSection from '@overview/SettingsTab/ExpandSection/ExpandSection';

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
    <ExpandSection toggleText={t('VirtualMachine actions confirmation')}>
      <SectionWithSwitch
        helpTextIconContent={t('Confirm requested VirtualMachine actions before executing them')}
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
