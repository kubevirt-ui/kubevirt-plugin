import React, { FC, useCallback, useMemo, useState } from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownList, Spinner } from '@patternfly/react-core';

import DeleteJobModal from '../../components/DeleteJobModal';
import {
  createDetailedResultsViewer,
  deleteSelfValidationJob,
  getTimestampFromJob,
  waitForNginxServer,
} from '../utils';

import DownloadResultsErrorModal from './DownloadResultsErrorModal';

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
        ? () => <Spinner size="sm" style={{ marginRight: 'var(--pf-t--global--spacer--md)' }} />
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

    // Extract timestamp from job
    const timestamp = getTimestampFromJob(job);
    if (!timestamp) {
      kubevirtConsole.error('No timestamp found in job:', job.metadata.name);
      createModal((props) => (
        <DownloadResultsErrorModal
          {...props}
          errorMessage={t(
            'Could not find timestamp in job. The results file cannot be downloaded.',
          )}
        />
      ));
      return;
    }

    // Check if PVC exists
    setIsDownloading(true);
    try {
      await k8sGet({
        model: PersistentVolumeClaimModel,
        name: job.metadata.name,
        ns: job.metadata.namespace,
      });
    } catch (error) {
      kubevirtConsole.error('PVC not found for job:', job.metadata.name, error);
      createModal((props) => (
        <DownloadResultsErrorModal
          {...props}
          errorMessage={t(
            'No PVC found for this checkup. Results cannot be downloaded without a PVC.',
          )}
        />
      ));
      setIsDownloading(false);
      return;
    }

    // Create nginx server and download results
    try {
      const route = await createDetailedResultsViewer(job.metadata.name, job.metadata.namespace);

      const url = `https://${route.spec?.host}`;
      const result = await waitForNginxServer(url, t, 60000); // 60 second timeout
      const fileUrl = `${url}/test-results-${timestamp}.tar.gz`;

      if (result.success) {
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      } else {
        createModal((props) => (
          <DownloadResultsErrorModal
            {...props}
            errorMessage={result.error || t('Failed to start detailed results server')}
            url={fileUrl}
          />
        ));
      }
    } catch (error) {
      kubevirtConsole.error('Failed to create detailed results viewer:', error);
      createModal((props) => (
        <DownloadResultsErrorModal
          {...props}
          errorMessage={t('Failed to create detailed results viewer. Please try again.')}
        />
      ));
    } finally {
      setIsDownloading(false);
    }
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
