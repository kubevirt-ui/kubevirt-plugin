import React, { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getClusterKey, getName } from '@kubevirt-utils/resources/shared';

import { isJobRunning } from '../../utils';
import { useAllRunningSelfValidationJobs } from '../hooks/useAllRunningSelfValidationJobs';

import { createCheckupsSelfValidationActionFactory } from './CheckupsSelfValidationActionFactory';

type CheckupsSelfValidationActionsProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  isKebab?: boolean;
  jobs: IoK8sApiBatchV1Job[];
};

const CheckupsSelfValidationActions: FC<CheckupsSelfValidationActionsProps> = ({
  configMap,
  isKebab = false,
  jobs,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { createModal } = useModal();
  const toast = useKubevirtToast();
  const [clusterRunningJobs] = useAllRunningSelfValidationJobs();

  const checkupsSelfValidationActionFactory = useMemo(
    () => createCheckupsSelfValidationActionFactory(t),
    [t],
  );

  const thisCheckupJobNames = useMemo(
    () => new Set(jobs.map((job) => `${getClusterKey(job)}-${getName(job)}`)),
    [jobs],
  );

  const otherRunningJobs = useMemo(
    () =>
      (clusterRunningJobs || []).filter(
        (job) => !thisCheckupJobNames.has(`${getClusterKey(job)}-${getName(job)}`),
      ),
    [clusterRunningJobs, thisCheckupJobNames],
  );

  const hasOtherRunningJobs = otherRunningJobs.length > 0;
  const hasCurrentCheckupRunningJobs = useMemo(() => jobs.some((job) => isJobRunning(job)), [jobs]);

  const actions = useMemo(() => {
    const rerunAction = checkupsSelfValidationActionFactory.rerun({
      configMap,
      createModal,
      hasCurrentCheckupRunningJobs,
      hasOtherRunningJobs,
      isKebab,
      jobs,
      navigate: (path: string) => navigate(path),
      otherRunningJobs,
      toast,
    });

    const goToAction = checkupsSelfValidationActionFactory.goToRunningCheckup({
      hasOtherRunningJobs,
      navigate: (path: string) => navigate(path),
      otherRunningJobs,
    });

    const deleteAction = checkupsSelfValidationActionFactory.delete({
      configMap,
      createModal,
      jobs,
      navigate: (path: string) => navigate(path),
      toast,
    });

    return [rerunAction, goToAction, deleteAction].filter(Boolean);
  }, [
    checkupsSelfValidationActionFactory,
    configMap,
    createModal,
    isKebab,
    jobs,
    navigate,
    otherRunningJobs,
    hasOtherRunningJobs,
    hasCurrentCheckupRunningJobs,
    toast,
  ]);

  return (
    <ActionsDropdown
      actions={actions}
      id="checkups-self-validation-actions"
      isKebabToggle={isKebab}
    />
  );
};

export default CheckupsSelfValidationActions;
