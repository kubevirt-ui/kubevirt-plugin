import React, { ReactNode } from 'react';

import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import RerunCheckupModal from '../../../components/RerunCheckupModal';
import { CHECKUP_URLS } from '../../../utils/constants';
import { trimLastHistoryPath } from '../../../utils/utils';
import { isJobRunning, rerunSelfValidationCheckup } from '../../utils';

import {
  CheckupsSelfValidationSharedActionParams,
  getActionState,
  SELF_VALIDATION_ACTION_MODE,
} from './CheckupsSelfValidationActionsUtils';
import RunningCheckupWarningDescription from './RunningCheckupWarningDescription';

export const createSelfValidationAction = ({
  configMap,
  createModal,
  hasCurrentCheckupRunningJobs = false,
  hasOtherRunningJobs = false,
  isCreateSelfValidationPermitted = true,
  jobs = [],
  label,
  locationPath,
  mode,
  navigate,
  otherRunningJobs = [],
  runningSelfValidationJobs = [],
}: CheckupsSelfValidationSharedActionParams): ActionDropdownItemType => {
  const isRunMode = mode === SELF_VALIDATION_ACTION_MODE.RUN;
  const isRerunMode = mode === SELF_VALIDATION_ACTION_MODE.RERUN;

  const { configMapInfo, isEnabled, showWarning } = getActionState(mode, {
    hasCurrentCheckupRunningJobs,
    hasOtherRunningJobs,
    isCreateSelfValidationPermitted,
    otherRunningJobs,
    runningSelfValidationJobs,
  });

  const executeRerun = async () => {
    if (!configMap) {
      kubevirtConsole.error('Cannot rerun checkup: configMap is missing');
      return;
    }

    try {
      await rerunSelfValidationCheckup(configMap, jobs);
    } catch (e) {
      kubevirtConsole.error('Failed to rerun checkup:', e);
      createModal((props) => (
        <RerunCheckupModal
          {...props}
          message={e?.message || t('An unknown error occurred')}
          variant="error"
        />
      ));
    }
  };

  const description: ReactNode | undefined =
    showWarning && configMapInfo ? (
      <RunningCheckupWarningDescription
        configMapName={configMapInfo.name}
        configMapNamespace={configMapInfo.namespace}
      />
    ) : undefined;

  const handleRunAction = () => {
    if (!navigate || !locationPath || !isEnabled) return;
    navigate(createURL(`${CHECKUP_URLS.SELF_VALIDATION}/form`, trimLastHistoryPath(locationPath)));
  };

  const handleRerunAction = () => {
    if (!createModal) {
      kubevirtConsole.error('Cannot rerun checkup: createModal is required');
      return;
    }

    const runningJobs = jobs.filter((job) => isJobRunning(job));
    if (runningJobs.length > 0) {
      createModal((props) => (
        <RerunCheckupModal
          {...props}
          message={t(
            'This self validation checkup is currently running. If you rerun the checkup, the running job will be deleted.',
          )}
          onConfirm={() => {
            props.onClose();
            executeRerun();
          }}
          variant="warning"
        />
      ));
    } else {
      executeRerun();
    }
  };

  return {
    cta: () => {
      if (isRunMode) {
        handleRunAction();
      } else if (isRerunMode) {
        handleRerunAction();
      }
    },
    description,
    disabled: !isEnabled,
    id: `checkup-${mode}-self-validation`,
    label,
  };
};
