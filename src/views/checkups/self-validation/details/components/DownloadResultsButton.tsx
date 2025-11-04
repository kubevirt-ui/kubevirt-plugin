import React, { useState } from 'react';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1PersistentVolumeClaim,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant, FlexItem } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';

import { CheckupsStatus, getJobStatus } from '../../../utils/utils';
import {
  createDetailedResultsViewer,
  getConfigMapStatus,
  getTimestampFromJob,
  waitForNginxServer,
} from '../../utils';

type DownloadResultsButtonProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  jobs: IoK8sApiBatchV1Job[];
  onError?: (error: null | string, url?: null | string) => void;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
};

const DownloadResultsButton: React.FC<DownloadResultsButtonProps> = ({
  configMap,
  jobs,
  onError,
  pvcs,
}) => {
  const { t } = useKubevirtTranslation();
  const [isCreatingViewer, setIsCreatingViewer] = useState(false);
  const [isWaitingForServer, setIsWaitingForServer] = useState(false);

  const job = jobs?.[0];
  const jobStatus = getJobStatus(job);
  const configMapStatus = getConfigMapStatus(configMap, jobStatus);
  const isCompleted = configMapStatus === CheckupsStatus.Done;

  const pvc = pvcs?.find((p) => p.metadata.name === job?.metadata?.name);

  const getButtonText = () => {
    if (isCreatingViewer || isWaitingForServer) return t('Waiting for server...');
    return t('Download results');
  };

  const handleDownloadResults = async () => {
    if (!pvc || !job) {
      kubevirtConsole.log('No PVC or job found for ConfigMap:', configMap.metadata.name);
      alert(
        t('No PVC found for this checkup. Detailed results cannot be displayed without a PVC.'),
      );
      return;
    }

    if (!isCompleted) {
      kubevirtConsole.log('Checkup not completed yet. Status:', configMapStatus);
      alert(
        t(
          'The checkup is not completed yet. Please wait for it to finish before viewing detailed results.',
        ),
      );
      return;
    }

    // Extract timestamp from job
    const timestamp = getTimestampFromJob(job);
    if (!timestamp) {
      kubevirtConsole.error('No timestamp found in job:', job.metadata.name);
      onError?.(t('Could not find timestamp in job. The results file cannot be downloaded.'), null);
      return;
    }

    onError?.(null, null);

    setIsCreatingViewer(true);
    try {
      const route = await createDetailedResultsViewer(
        job.metadata.name,
        configMap.metadata.namespace,
      );

      // Wait for the nginx server to be ready with health checks
      const url = `https://${route.spec?.host}`;
      setIsWaitingForServer(true);

      try {
        const result = await waitForNginxServer(url, t, 60000); // 60 second timeout
        const fileUrl = `${url}/test-results-${timestamp}.tar.gz`;

        if (result.success) {
          // Trigger download
          window.open(fileUrl, '_blank', 'noopener,noreferrer');
        } else {
          onError?.(result.error || t('Failed to start detailed results server'), fileUrl);
        }
      } catch (error) {
        kubevirtConsole.error('Failed to wait for detailed results server:', error);
        const fileUrl = `${url}/test-results-${timestamp}.tar.gz`;
        onError?.(
          t(
            'Unable to access the detailed results server. This may be due to CORS restrictions or network connectivity issues.',
          ),
          fileUrl,
        );
      } finally {
        setIsWaitingForServer(false);
      }
    } catch (error) {
      kubevirtConsole.error('Failed to create detailed results viewer:', error);
      onError?.('Failed to create detailed results viewer. Please try again.', null);
    } finally {
      setIsCreatingViewer(false);
    }
  };

  if (!isCompleted) {
    return null;
  }

  return (
    <FlexItem>
      <Button
        icon={<DownloadIcon />}
        isDisabled={isCreatingViewer || isWaitingForServer}
        isLoading={isCreatingViewer || isWaitingForServer}
        onClick={handleDownloadResults}
        variant={ButtonVariant.link}
      >
        {getButtonText()}
      </Button>
    </FlexItem>
  );
};

export default DownloadResultsButton;
