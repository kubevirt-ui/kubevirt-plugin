import React, { FCC } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { CONFIRM_VM_ACTIONS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

type VMActionsConfirmationProps = {
  newBadge: boolean;
};

const VMActionsConfirmation: FCC<VMActionsConfirmationProps> = ({ newBadge }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const isAdmin = useIsAdmin();
  const {
    featureEnabled: confirmVMActionsEnabled,
    loading,
    toggleFeature: toggleConfirmVMActionsEnabled,
  } = useFeatures(CONFIRM_VM_ACTIONS, cluster);

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.vmActionsConfirmation}
      toggleText={t('VirtualMachine actions confirmation')}
    >
      <SectionWithSwitch
        dataTestID="confirm-vm-actions"
        helpTextIconContent={t('Confirm requested VirtualMachine actions before executing them')}
        id="confirm-vm-actions"
        isDisabled={!isAdmin}
        isLoading={loading}
        newBadge={newBadge}
        olsPromptType={OLSPromptType.CONFIRM_VM_ACTIONS}
        switchIsOn={confirmVMActionsEnabled}
        title={t('Confirm VirtualMachine actions')}
        turnOnSwitch={toggleConfirmVMActionsEnabled}
      />
    </ExpandSection>
  );
};

export default VMActionsConfirmation;
