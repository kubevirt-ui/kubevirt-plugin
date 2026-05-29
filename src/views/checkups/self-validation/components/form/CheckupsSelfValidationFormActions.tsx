import React, { FC, ReactNode, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getSelfValidationCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { ActionGroup, Button, ButtonVariant } from '@patternfly/react-core';

import { createSelfValidationCheckup } from '../../utils';
import {
  getActionState,
  SELF_VALIDATION_ACTION_MODE,
} from '../actions/CheckupsSelfValidationActionsUtils';
import { useAllRunningSelfValidationJobs } from '../hooks/useAllRunningSelfValidationJobs';
import useCheckupsSelfValidationPermissions from '../hooks/useCheckupsSelfValidationPermissions';

import HeavyLoadCheckupConfirmationModal from './HeavyLoadCheckupConfirmationModal';
import RunButtonWithTooltip from './RunButtonWithTooltip';
import { CheckupsSelfValidationFormActionsProps } from './types';
import { resolveWinImageName } from './utils';

const CheckupsSelfValidationFormActions: FC<CheckupsSelfValidationFormActionsProps> = ({
  acceptWindowsEula,
  checkupImage,
  isDryRun,
  isEulaConfirmed,
  name,
  pvcSize,
  selectedTestSuites,
  storageCapabilities,
  storageClass,
  testSkips,
  winImageDownloadUrl,
  winImageName,
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

  const resolvedWinImageName = resolveWinImageName(winImageName);

  const eulaPendingConfirmation = acceptWindowsEula && !isEulaConfirmed;
  const isFormValid = name && checkupImage && selectedTestSuites.length > 0;
  const isSubmitDisabled =
    isSubmitting ||
    !isFormValid ||
    hasRunningCheckup ||
    !selfValidationActionState?.isEnabled ||
    eulaPendingConfirmation;

  const showRunningCheckupTooltip =
    hasRunningCheckup &&
    selfValidationActionState?.showWarning &&
    selfValidationActionState?.configMapInfo;

  const showTooltip = eulaPendingConfirmation || showRunningCheckupTooltip;

  const executeRun = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await createSelfValidationCheckup({
        acceptWindowsEula,
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
        ...(acceptWindowsEula && winImageDownloadUrl && { winImageDownloadUrl }),
        ...(acceptWindowsEula && resolvedWinImageName && { winImageName: resolvedWinImageName }),
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

  return (
    <>
      {error && <ErrorAlert error={{ message: error }} />}
      <ActionGroup>
        <RunButtonWithTooltip
          configMapInfo={selfValidationActionState?.configMapInfo}
          eulaPendingConfirmation={eulaPendingConfirmation}
          isSubmitDisabled={isSubmitDisabled}
          isSubmitting={isSubmitting}
          onClick={handleOpenConfirmation}
          showRunningCheckupTooltip={Boolean(showRunningCheckupTooltip)}
          showTooltip={Boolean(showTooltip)}
        />
        <Button onClick={() => navigate(-1)} variant={ButtonVariant.secondary}>
          {t('Cancel')}
        </Button>
      </ActionGroup>
    </>
  );
};

export default CheckupsSelfValidationFormActions;
