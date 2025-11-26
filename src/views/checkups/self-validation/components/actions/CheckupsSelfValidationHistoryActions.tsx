import React, { FC, useCallback, useMemo, useState } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Dropdown, DropdownItem, DropdownList, Spinner } from '@patternfly/react-core';

import DeleteJobModal from '../../../components/DeleteJobModal';
import { deleteSelfValidationJob, downloadResults } from '../../utils';
import DownloadResultsErrorModal from '../DownloadResultsErrorModal';

type CheckupsSelfValidationHistoryActionsProps = {
  job: IoK8sApiBatchV1Job;
};

const CheckupsSelfValidationHistoryActions: FC<CheckupsSelfValidationHistoryActionsProps> = ({
  job,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const onToggle = useCallback(() => setIsActionsOpen((prevIsOpen) => !prevIsOpen), []);

  const Toggle = useMemo(
    () =>
      isDownloading
        ? (_toggleRef) => (
            <Spinner size="sm" style={{ marginRight: 'var(--pf-t--global--spacer--md)' }} />
          )
        : KebabToggle({ isExpanded: isActionsOpen, onClick: onToggle }),
    [isActionsOpen, isDownloading, onToggle],
  );

  const handleDeleteClick = useCallback(() => {
    setIsActionsOpen(false);
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
    setIsActionsOpen(false);

    const namespace = job.metadata.namespace;
    if (!namespace) {
      kubevirtConsole.error('No namespace found for job:', job.metadata.name);
      createModal((props) => (
        <DownloadResultsErrorModal
          {...props}
          errorMessage={t('Could not determine namespace for this job.')}
        />
      ));
      return;
    }

    await downloadResults({
      job,
      namespace,
      onError: (errorMessage, url) => {
        createModal((props) => (
          <DownloadResultsErrorModal {...props} errorMessage={errorMessage} url={url} />
        ));
      },
      onProgress: (isWaiting) => {
        setIsDownloading(isWaiting);
      },
      t,
    });
  }, [job, createModal, t]);

  const isJobCompleted = job?.status?.succeeded === 1 && job?.status?.terminating !== 1;

  return (
    <Dropdown
      isOpen={isActionsOpen}
      onOpenChange={setIsActionsOpen}
      popperProps={{ position: 'right' }}
      toggle={Toggle}
    >
      <DropdownList>
        {isJobCompleted && (
          <DropdownItem
            isDisabled={isDeleting}
            key="download-results"
            onClick={handleDownloadResultsClick}
          >
            {t('Download results')}
          </DropdownItem>
        )}
        <DropdownItem
          isDisabled={isDeleting || job?.status?.terminating === 1}
          key="delete"
          onClick={handleDeleteClick}
        >
          {t('Delete')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default CheckupsSelfValidationHistoryActions;
