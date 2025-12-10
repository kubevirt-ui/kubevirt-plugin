import React, { FC } from 'react';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant, FlexItem } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';

import { CheckupsStatus, getJobStatus } from '../../../utils/utils';
import DownloadResultsErrorModal from '../../components/DownloadResultsErrorModal';
import { useDownloadResults } from '../../components/hooks/useDownloadResults';
import { getDefaultErrorMessage } from '../../utils/downloadResults';

type DownloadResultsButtonProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  job: IoK8sApiBatchV1Job;
};

const DownloadResultsButton: FC<DownloadResultsButtonProps> = ({ configMap, job }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { download, isDownloading } = useDownloadResults();

  const jobStatus = job ? getJobStatus(job) : null;
  const isCompleted = jobStatus === CheckupsStatus.Done;
  const namespace = configMap?.metadata?.namespace || null;

  if (!configMap || !job) {
    return null;
  }

  const handleDownloadResults = async () => {
    if (!isCompleted) {
      kubevirtConsole.log('Checkup not completed yet. Status:', jobStatus);
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
  };

  if (!isCompleted) {
    return null;
  }

  return (
    <FlexItem>
      <Button
        icon={<DownloadIcon />}
        isDisabled={isDownloading}
        isLoading={isDownloading}
        onClick={handleDownloadResults}
        variant={ButtonVariant.link}
      >
        {t('Download results')}
      </Button>
    </FlexItem>
  );
};

export default DownloadResultsButton;
