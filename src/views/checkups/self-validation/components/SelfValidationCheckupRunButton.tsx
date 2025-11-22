import React, { FC, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import { CHECKUP_URLS } from '../../utils/constants';
import { trimLastHistoryPath } from '../../utils/utils';

import {
  getActionState,
  SELF_VALIDATION_ACTION_MODE,
} from './actions/CheckupsSelfValidationActionsUtils';
import RunningCheckupWarningDescription from './actions/RunningCheckupWarningDescription';
import { useAllRunningSelfValidationJobs } from './hooks/useAllRunningSelfValidationJobs';
import useCheckupsSelfValidationPermissions from './hooks/useCheckupsSelfValidationPermissions';

const SelfValidationCheckupRunButton: FC = () => {
  const [namespace] = useActiveNamespace();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useKubevirtTranslation();

  const { isPermitted: isCreateSelfValidationPermitted } = useCheckupsSelfValidationPermissions();
  const [runningSelfValidationJobs, jobsLoaded, jobsError] = useAllRunningSelfValidationJobs();

  const selfValidationActionState = useMemo(
    () =>
      jobsLoaded
        ? getActionState(SELF_VALIDATION_ACTION_MODE.RUN, {
            hasCurrentCheckupRunningJobs: false,
            hasOtherRunningJobs: false,
            isCreateSelfValidationPermitted,
            otherRunningJobs: [],
            runningSelfValidationJobs: runningSelfValidationJobs || [],
          })
        : null,
    [isCreateSelfValidationPermitted, runningSelfValidationJobs, jobsLoaded],
  );

  const isDisabled = useMemo(() => {
    if (ALL_NAMESPACES_SESSION_KEY === namespace) {
      return true;
    }
    if (!jobsLoaded || jobsError) {
      return true;
    }
    return selfValidationActionState ? !selfValidationActionState.isEnabled : true;
  }, [namespace, selfValidationActionState, jobsLoaded, jobsError]);

  const handleRunCheckup = () => {
    if (isDisabled || !selfValidationActionState?.isEnabled) return;

    const basePath = trimLastHistoryPath(location.pathname);
    navigate(createURL(`${CHECKUP_URLS.SELF_VALIDATION}/form`, basePath));
  };

  const showTooltip =
    isDisabled &&
    selfValidationActionState?.showWarning &&
    selfValidationActionState?.configMapInfo;

  const button = (
    <Button
      className={classNames({
        'CheckupsRunButton--main': ALL_NAMESPACES_SESSION_KEY === namespace,
      })}
      id="checkups-run-button"
      isDisabled={isDisabled}
      onClick={handleRunCheckup}
      variant={ButtonVariant.primary}
    >
      {t('Run checkup')}
    </Button>
  );

  if (showTooltip && selfValidationActionState?.configMapInfo) {
    return (
      <Tooltip
        content={
          <RunningCheckupWarningDescription
            configMapName={selfValidationActionState.configMapInfo.name}
            configMapNamespace={selfValidationActionState.configMapInfo.namespace}
          />
        }
      >
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
};

export default SelfValidationCheckupRunButton;
