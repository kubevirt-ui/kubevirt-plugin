import React, { FC, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import DeleteCheckupModal from '../../components/DeleteCheckupModal';
import RerunCheckupModal from '../../components/RerunCheckupModal';
import { CHECKUP_URLS } from '../../utils/constants';
import { getCheckupImageFromNewestJob } from '../../utils/utils';
import {
  deleteSelfValidationCheckup,
  getAllRunningSelfValidationJobs,
  getRunningCheckupErrorMessage,
  isJobRunning,
  rerunSelfValidationCheckup,
} from '../utils';

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
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);

  const checkupImage = useMemo(() => getCheckupImageFromNewestJob(jobs), [jobs]);

  const onToggle = useCallback(() => setIsActionsOpen((prevIsOpen) => !prevIsOpen), []);

  const Toggle = useMemo(
    () =>
      isKebab
        ? KebabToggle({ isExpanded: isActionsOpen, onClick: onToggle })
        : DropdownToggle({ children: t('Actions'), isExpanded: isActionsOpen, onClick: onToggle }),
    [isKebab, isActionsOpen, onToggle, t],
  );

  const deleteCheckup = useCallback(() => {
    setIsActionsOpen(false);
    // No need to wait for the deletion to complete, just navigate away
    deleteSelfValidationCheckup(configMap, jobs);
    navigate(`/k8s/ns/${getNamespace(configMap)}/checkups/${CHECKUP_URLS.SELF_VALIDATION}`);
  }, [configMap, jobs, navigate]);

  const handleDeleteClick = useCallback(() => {
    setIsActionsOpen(false);
    createModal((props) => (
      <DeleteCheckupModal
        {...props}
        name={getName(configMap)}
        namespace={getNamespace(configMap)}
        onDelete={deleteCheckup}
      />
    ));
  }, [configMap, createModal, deleteCheckup]);

  const executeRerun = useCallback(async () => {
    try {
      await rerunSelfValidationCheckup(configMap, jobs, checkupImage);
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
  }, [configMap, jobs, checkupImage, createModal, t]);

  const handleRerunClick = useCallback(async () => {
    setIsActionsOpen(false);

    try {
      const clusterRunningJobs = await getAllRunningSelfValidationJobs();
      const thisCheckupJobNames = new Set(jobs.map((job) => job.metadata.name));

      const otherRunningJobs = clusterRunningJobs.filter(
        (job) => !thisCheckupJobNames.has(job.metadata.name),
      );

      if (otherRunningJobs.length > 0) {
        createModal((props) => (
          <RerunCheckupModal
            {...props}
            message={getRunningCheckupErrorMessage(t, otherRunningJobs, props.onClose)}
            variant="error"
          />
        ));
        return;
      }

      const runningJobs = jobs.filter((job) => isJobRunning(job));

      if (runningJobs.length > 0) {
        createModal((props) => (
          <RerunCheckupModal
            {...props}
            message={t(
              'A self validation checkup is currently running. If you rerun the checkup, the running job will be deleted.',
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
    } catch (error) {
      kubevirtConsole.error('Failed to check running jobs:', error);
    }
  }, [jobs, createModal, t, executeRerun]);

  return (
    <Dropdown
      isOpen={isActionsOpen}
      onOpenChange={setIsActionsOpen}
      popperProps={{ position: 'right' }}
      toggle={Toggle}
    >
      <DropdownList>
        <DropdownItem key="rerun" onClick={handleRerunClick}>
          {t('Rerun')}
        </DropdownItem>
        <DropdownItem key="delete" onClick={handleDeleteClick}>
          {t('Delete')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default CheckupsSelfValidationActions;
