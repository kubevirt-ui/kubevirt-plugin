import React, { FCC, useMemo } from 'react';
import { useNavigate } from 'react-router';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

import { isJobRunning } from '../../utils';
import { useAllRunningSelfValidationJobs } from '../hooks/useAllRunningSelfValidationJobs';

import { createCheckupsSelfValidationActionFactory } from './CheckupsSelfValidationActionFactory';

type CheckupsSelfValidationActionsProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  isKebab?: boolean;
  jobs: IoK8sApiBatchV1Job[];
};

const CheckupsSelfValidationActions: FCC<CheckupsSelfValidationActionsProps> = ({
  configMap,
  isKebab = false,
  jobs,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { createModal } = useModal();
  const [clusterRunningJobs] = useAllRunningSelfValidationJobs();

  const checkupsSelfValidationActionFactory = useMemo(
    () => createCheckupsSelfValidationActionFactory(t),
    [t],
  );

  const thisCheckupJobNames = useMemo(
    () => new Set(jobs.map((job) => `${getCluster(job) || SINGLE_CLUSTER_KEY}-${getName(job)}`)),
    [jobs],
  );

  const otherRunningJobs = useMemo(
    () =>
      (clusterRunningJobs || []).filter(
        (job) =>
          !thisCheckupJobNames.has(`${getCluster(job) || SINGLE_CLUSTER_KEY}-${getName(job)}`),
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
      jobs,
      navigate: (path: string) => navigate(path),
      otherRunningJobs,
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
    });

    return [rerunAction, goToAction, deleteAction].filter(Boolean);
  }, [
    checkupsSelfValidationActionFactory,
    configMap,
    createModal,
    jobs,
    navigate,
    otherRunningJobs,
    hasOtherRunningJobs,
    hasCurrentCheckupRunningJobs,
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
