import React, { FC, useCallback, useMemo, useState } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Spinner } from '@patternfly/react-core';

import DeleteJobModal from '../../../components/DeleteJobModal';
import { deleteSelfValidationJob } from '../../utils';
import { getDefaultErrorMessage } from '../../utils/downloadResults';
import DownloadResultsErrorModal from '../DownloadResultsErrorModal';
import { useDownloadResults } from '../hooks/useDownloadResults';

type CheckupsSelfValidationHistoryActionsProps = {
  job: IoK8sApiBatchV1Job;
};

const CheckupsSelfValidationHistoryActions: FC<CheckupsSelfValidationHistoryActionsProps> = ({
  job,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { download, isDownloading } = useDownloadResults();
  const isJobCompleted = job?.status?.succeeded === 1 && job?.status?.terminating !== 1;
  const namespace = job?.metadata?.namespace || null;

  const handleDeleteClick = useCallback(() => {
    createModal((props) => (
      <DeleteJobModal
        {...props}
        onDelete={async () => {
          setIsDeleting(true);
          try {
            await deleteSelfValidationJob(job);
          } catch (error) {
            kubevirtConsole.error('Failed to delete job:', error);
          } finally {
            setIsDeleting(false);
          }
        }}
        jobName={job?.metadata?.name}
        namespace={job?.metadata?.namespace}
      />
    ));
  }, [job, createModal]);

  const handleDownloadResultsClick = useCallback(async () => {
    if (!isJobCompleted || !job) {
      return;
    }
    const result = await download(job, namespace);
    if (result && !result.success && result.error) {
      createModal((props) => (
        <DownloadResultsErrorModal
          {...props}
          errorMessage={result.error.message || getDefaultErrorMessage(t)}
          url={result.error.certificateUrl}
        />
      ));
    }
  }, [job, namespace, isJobCompleted, download, createModal, t]);

  const actions = useMemo<ActionDropdownItemType[]>(() => {
    const actionItems: ActionDropdownItemType[] = [];

    if (isJobCompleted) {
      actionItems.push({
        cta: handleDownloadResultsClick,
        disabled: isDownloading || isDeleting,
        id: 'download-results',
        label: t('Download results'),
      });
    }

    actionItems.push({
      cta: handleDeleteClick,
      disabled: isDeleting || job?.status?.terminating === 1,
      id: 'delete',
      label: t('Delete'),
    });

    return actionItems;
  }, [
    isJobCompleted,
    isDownloading,
    isDeleting,
    job?.status?.terminating,
    handleDownloadResultsClick,
    handleDeleteClick,
    t,
  ]);

  if (isDownloading || isDeleting) {
    return (
      <span>
        <Spinner size="sm" style={{ marginRight: 'var(--pf-t--global--spacer--md)' }} />
      </span>
    );
  }

  return (
    <ActionsDropdown
      actions={actions}
      id="checkups-self-validation-history-actions"
      isKebabToggle
    />
  );
};

export default CheckupsSelfValidationHistoryActions;
