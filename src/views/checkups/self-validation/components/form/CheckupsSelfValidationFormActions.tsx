import React, { FC, ReactNode, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getSelfValidationCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { ActionGroup, Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

import { createSelfValidationCheckup } from '../../utils';
import {
  getActionState,
  SELF_VALIDATION_ACTION_MODE,
} from '../actions/CheckupsSelfValidationActionsUtils';
import RunningCheckupWarningDescription from '../actions/RunningCheckupWarningDescription';
import { useAllRunningSelfValidationJobs } from '../hooks/useAllRunningSelfValidationJobs';
import useCheckupsSelfValidationPermissions from '../hooks/useCheckupsSelfValidationPermissions';

import HeavyLoadCheckupConfirmationModal from './HeavyLoadCheckupConfirmationModal';

type CheckupsSelfValidationFormActionsProps = {
  checkupImage: string;
  isDryRun: boolean;
  name: string;
  pvcSize: string;
  selectedTestSuites: string[];
  storageCapabilities?: string[];
  storageClass?: string;
  testSkips?: string;
};

const CheckupsSelfValidationFormActions: FC<CheckupsSelfValidationFormActionsProps> = ({
  checkupImage,
  isDryRun,
  name,
  pvcSize,
  selectedTestSuites,
  storageCapabilities,
  storageClass,
  testSkips,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const namespace = useActiveNamespace();
  const { createModal } = useModal();
  const cluster = useClusterParam();

  const [error, setError] = useState<ReactNode>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isPermitted: isCreateSelfValidationPermitted } = useCheckupsSelfValidationPermissions();
  const [runningSelfValidationJobs] = useAllRunningSelfValidationJobs();

  const selfValidationActionState = useMemo(
    () =>
      getActionState(SELF_VALIDATION_ACTION_MODE.RUN, {
        hasCurrentCheckupRunningJobs: false,
        hasOtherRunningJobs: false,
        isCreateSelfValidationPermitted,
        otherRunningJobs: [],
        runningSelfValidationJobs: runningSelfValidationJobs || [],
      }),
    [isCreateSelfValidationPermitted, runningSelfValidationJobs],
  );

  const hasRunningCheckup = useMemo(
    () => selfValidationActionState?.showWarning && !selfValidationActionState?.isEnabled,
    [selfValidationActionState],
  );

  const isFormValid = name && checkupImage && selectedTestSuites.length > 0;
  const isSubmitDisabled =
    isSubmitting || !isFormValid || hasRunningCheckup || !selfValidationActionState?.isEnabled;

  const showTooltip =
    hasRunningCheckup &&
    selfValidationActionState?.showWarning &&
    selfValidationActionState?.configMapInfo;

  const executeRun = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await createSelfValidationCheckup({
        checkupImage,
        cluster,
        isDryRun,
        name,
        namespace,
        pvcSize,
        selectedTestSuites,
        storageCapabilities,
        storageClass,
        testSkips,
      });
      navigate(getSelfValidationCheckupURL(name, namespace, cluster));
    } catch (e) {
      kubevirtConsole.error(e);
      setError(e?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenConfirmation = () => {
    createModal(({ isOpen, onClose }) => (
      <HeavyLoadCheckupConfirmationModal
        onConfirm={() => {
          onClose();
          executeRun();
        }}
        isOpen={isOpen}
        onClose={onClose}
      />
    ));
  };

  const runButton = (
    <Button
      isDisabled={isSubmitDisabled}
      isLoading={isSubmitting}
      onClick={handleOpenConfirmation}
      variant={ButtonVariant.primary}
    >
      {t('Run')}
    </Button>
  );

  return (
    <>
      {error && <ErrorAlert error={{ message: error }} />}
      <ActionGroup>
        {showTooltip && selfValidationActionState?.configMapInfo ? (
          <Tooltip
            content={
              <RunningCheckupWarningDescription
                configMapCluster={selfValidationActionState.configMapInfo.cluster}
                configMapName={selfValidationActionState.configMapInfo.name}
                configMapNamespace={selfValidationActionState.configMapInfo.namespace}
              />
            }
          >
            <span>{runButton}</span>
          </Tooltip>
        ) : (
          runButton
        )}
        <Button onClick={() => navigate(-1)} variant={ButtonVariant.secondary}>
          {t('Cancel')}
        </Button>
      </ActionGroup>
    </>
  );
};

export default CheckupsSelfValidationFormActions;
