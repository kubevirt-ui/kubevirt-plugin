import React, { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useListNamespaces from '@kubevirt-utils/hooks/useListNamespaces';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { CHECKUP_URLS } from '../../utils/constants';

import {
  getActionState,
  SELF_VALIDATION_ACTION_MODE,
} from './actions/CheckupsSelfValidationActionsUtils';
import RunningCheckupWarningDescription from './actions/RunningCheckupWarningDescription';
import { useAllRunningSelfValidationJobs } from './hooks/useAllRunningSelfValidationJobs';
import useCheckupsSelfValidationPermissions from './hooks/useCheckupsSelfValidationPermissions';

const SelfValidationCheckupRunButton: FC = () => {
  const navigate = useNavigate();
  const isACMpage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();
  const clusterParam = useListClusters();
  const namespaces = useListNamespaces();
  const namespace = namespaces?.[0];

  const cluster = clusterParam?.[0] || hubClusterName;

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
    if (isEmpty(namespace)) {
      return true;
    }
    if (!jobsLoaded || jobsError) {
      return true;
    }
    return selfValidationActionState ? !selfValidationActionState.isEnabled : true;
  }, [namespace, selfValidationActionState, jobsLoaded, jobsError]);

  const handleRunCheckup = () => {
    if (!namespace || isDisabled || !selfValidationActionState?.isEnabled) return;

    if (isACMpage) {
      navigate(
        `/k8s/cluster/${cluster}/ns/${namespace}/checkups/${CHECKUP_URLS.SELF_VALIDATION}/form`,
      );
    } else {
      navigate(`/k8s/ns/${namespace}/checkups/${CHECKUP_URLS.SELF_VALIDATION}/form`);
    }
  };

  const showTooltip =
    isDisabled &&
    selfValidationActionState?.showWarning &&
    selfValidationActionState?.configMapInfo;

  const button = (
    <Button
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
            configMapCluster={selfValidationActionState.configMapInfo.cluster}
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
