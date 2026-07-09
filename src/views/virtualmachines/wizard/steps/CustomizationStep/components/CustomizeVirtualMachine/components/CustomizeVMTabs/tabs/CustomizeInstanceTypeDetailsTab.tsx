import React, { useEffect, useState } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import {
  DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  TREE_VIEW_FOLDERS,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { getPreferredBootmode } from '@kubevirt-utils/resources/preference/helper';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { getDevices } from '@kubevirt-utils/resources/vm';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Grid } from '@patternfly/react-core';
import { isDeletionProtectionEnabled } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';

import usePreference from '../hooks/usePreference';

import DetailsLeftColumn from './components/DetailsLeftColumn';
import DetailsRightColumn from './components/DetailsRightColumn';

const CustomizeInstanceTypeDetailsTab = () => {
  const vm = customizeWizardVMSignal.value;

  const [preference, preferenceLoading] = usePreference(vm);

  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});

  const { featureEnabled: isGuestSystemLogsDisabled } = useFeatures(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );
  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);

  const logSerialConsole = getDevices(vm)?.logSerialConsole;
  const [isCheckedGuestSystemAccessLog, setIsCheckedGuestSystemAccessLog] = useState<boolean>();

  const deletionProtectionEnabled = isDeletionProtectionEnabled(vm);

  useEffect(
    () =>
      setIsCheckedGuestSystemAccessLog(
        logSerialConsole || (logSerialConsole === undefined && !isGuestSystemLogsDisabled),
      ),
    [isGuestSystemLogsDisabled, logSerialConsole],
  );

  if (!vm || preferenceLoading) {
    return <Loading />;
  }

  return (
    <Grid>
      <DetailsLeftColumn
        deletionProtectionEnabled={deletionProtectionEnabled}
        isCheckedGuestSystemAccessLog={isCheckedGuestSystemAccessLog}
        isGuestSystemLogsDisabled={isGuestSystemLogsDisabled}
        setIsCheckedGuestSystemAccessLog={setIsCheckedGuestSystemAccessLog}
        treeViewFoldersEnabled={treeViewFoldersEnabled}
      />
      <DetailsRightColumn
        canUpdateVM={canUpdateVM}
        preferredBootmode={getPreferredBootmode(preference)}
      />
    </Grid>
  );
};

export default CustomizeInstanceTypeDetailsTab;
